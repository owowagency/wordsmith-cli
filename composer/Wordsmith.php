<?php

namespace owowagency;

use Composer\Script\Event;

class Wordsmith {
    public static function run(Event $event): int {
        $arch = static::get_architecture();
        $platform = static::get_platform();

        if (! key_exists($platform, static::$supported)) {
            fwrite(STDERR, "Unsupported platform $platform [$arch]\n");
            return static::ERR_UNSUPPORTED_PLATFORM;
        }

        if (! in_array($arch, static::$supported[$platform])) {
            fwrite(STDERR, "Unsupported platform $platform [$arch]\n");
            return static::ERR_UNSUPPORTED_PLATFORM;
        }

        $pwd = dirname(__FILE__);
        $args = join(' ', $event->getArguments());
        $binary_postfix = $platform === 'win32' ? '.exe' : '';
        $binary_name = "wordsmith$binary_postfix";
        $binary = realpath(join(DIRECTORY_SEPARATOR, [$pwd, '..', 'bin', $platform, $arch, $binary_name]));

        $result_code = 0;
        passthru("$binary $args", $result_code);
        return $result_code;
    }

    private static function get_architecture(): string {
        $machine = php_uname(mode: 'm');
        if (key_exists($machine, static::$architecture_mapping)) {
            return static::$architecture_mapping[$machine];
        }

        return $machine;
    }

    private static function get_platform(): string {
        return strtolower(php_uname(mode: 's'));
    }

    private static $supported = [
        'win32' => ['x64'],
        'darwin' => ['arm64'],
        'linux' => ['x64', 'arm64'],
    ];

    private static $architecture_mapping = [
        'aarch64' => 'arm64',
        'x84_64' => 'x64',
    ];

    private const ERR_UNSUPPORTED_PLATFORM = 1;
}

