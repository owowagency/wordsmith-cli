<?php

namespace OwowAgency;

use OwowAgency\WordsmithException;
use Composer\InstalledVersions;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Exception\GuzzleException;

class WordsmithCLI {
    private string $version;
    private string $arch;
    private string $platform;
    private Client $client;

    private const ERR_DOWNLOAD_FAILED = 2;
    private const ORGANISATION = 'owowagency';
    private const REPOSITORY = 'wordsmith-cli';

    private static $architecture_mapping = [
        'arm64' => 'aarch64',
        'x64' => 'x86_64',
    ];

    private static $platform_mapping = [
        'darwin' => 'apple-darwin',
        'linux' => 'unknown-linux-gnu',
        'win32' => 'pc-windows-msvc',
    ];

    public function __construct()
    {   
        $this->version = static::get_version();
        $this->version = '1.5.16';
        $this->arch = static::get_architecture();
        $this->platform = static::get_platform();
        $this->client = new Client();
    }

    public function run(array $arguments): int {
        $binary = $this->get_binary_location();
        if (! file_exists($binary)) {
            $this->download($binary);
        }

        if (! chmod($binary, 555)) {
            throw new WordsmithException("Unable to set executable permissions", WordsmithException::ERR_CHMOD);
        }

        $args = join(' ', $arguments);
        $result_code = 0;
        passthru("$binary $args", $result_code);
        return $result_code;
    }

    private function download(string $path) {
        $directory = dirname($path);
        if (! file_exists($directory)) {
            if (! mkdir($directory, recursive: true)) {
                throw new WordsmithException("Unable to create directory $directory", WordsmithException::ERR_CREATE_DIR);
            }
        }

        $file_handle = fopen($path, 'w');

        if ($file_handle === false) {
            throw new WordsmithException("Unable to create file $path", WordsmithException::ERR_CREATE_FILE);
        }

        $url = $this->create_url();
        
        try {
            $response = $this->client->request('GET', $url, [
                'sink' => $file_handle,
                'progress' => $this->create_progress_reporter(),
            ]);
        } catch (RequestException $e) {
            $status = $e->getResponse()->getStatusCode();
            fclose($file_handle);
            unlink($path);

            if ($status === 404) {
                $version = $this->version;
                $arch = $this->arch;
                $platform = $this->platform;
                throw new WordsmithException(
                    "Could not find a release for version: v$version [$arch-$platform]", 
                    WordsmithException::ERR_RELEASE_NOT_FOUND
                );
            }

            throw new WordsmithException("Unable to download $url [$status]", WordsmithException::ERR_HTTP, $e);
        } catch (GuzzleException $e) {
            fclose($file_handle);
            unlink($path);
            throw new WordsmithException("Unable to download $url", WordsmithException::ERR_GUZZLE, $e);
        }

        // Not sure if we can expect status to be between 200-299 after catching RequestExceptions?
        $status = $response->getStatusCode();

        if ($status >= 200 && $status <= 299) {
            return;
        }
        
        unlink($path);

        throw new WordsmithException("Failed to download $url [$status]", WordsmithException::ERR_HTTP);
    }

    private static function get_version(): string {
        $organisation = static::ORGANISATION;
        $repo = static::REPOSITORY;
        return InstalledVersions::getPrettyVersion("$organisation/$repo");
    }

    private static function get_architecture(): string {
        $arch = php_uname(mode: 'm');
        if (key_exists($arch, static::$architecture_mapping)) {
            return static::$architecture_mapping[$arch];
        }

        return $arch;
    }

    private static function get_platform(): string {
        $platform = strtolower(php_uname(mode: 's'));
        if (key_exists($platform, static::$platform_mapping)) {
            return static::$platform_mapping[$platform];
        }

        return $platform;
    }

    private static function get_ext(): string {
        if (strtolower(php_uname(mode: 's')) === 'win32') {
            return '.exe';
        }

        return '';
    }

    private function get_binary_location() {
        $pwd = dirname(__FILE__);
        $ext = static::get_ext();
        $version = $this->version;
        return join(DIRECTORY_SEPARATOR, [$pwd, '..', 'bin', "v$version", "wordsmith$ext"]);
    }

    private function create_url(): string {
        $organisation = static::ORGANISATION;
        $repo = static::REPOSITORY;
        $version = $this->version;
        $arch = $this->arch;
        $platform = $this->platform;
        $ext = static::get_ext();

        return "https://github.com/$organisation/$repo/releases/download/v$version/wordsmith-$arch-$platform$ext";
    }

    private function create_progress_reporter() {
        $done = false;
        $version = $this->version;
        $name = "Wordsmith CLI v$version";
        return function (int $downloadTotal, int $downloadedBytes) use ($name, &$done) {
            if ($done) {
                return;
            }

            if ($downloadTotal == 0) {
                return;
            }

            $progress = $downloadedBytes / $downloadTotal;
            $percent = $progress * 100;
            $bar = str_pad(str_repeat('=', floor($percent / 2)) . '>', (100 / 2) + 1);
            $message = sprintf("Downloading %s [\033[0;32m%s\033[0m] \033[0;32m%.2f\033[0m%%", $name, $bar, $percent);
        
            if ($downloadedBytes >= $downloadTotal) {
                fwrite(STDOUT, "\033[K$message\n");
                $done = true;
            } else {
                fwrite(STDOUT, "\033[K$message\r");
            }
        };
    }
}
