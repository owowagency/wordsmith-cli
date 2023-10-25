<?php

namespace OwowAgency;

class WordsmithException extends \Exception {
    public const ERR_CREATE_DIR = 10;
    public const ERR_CREATE_FILE = 11;
    public const ERR_RELEASE_NOT_FOUND = 12;
    public const ERR_HTTP = 13;
    public const ERR_GUZZLE = 14;
    public const ERR_CHMOD = 15;
}