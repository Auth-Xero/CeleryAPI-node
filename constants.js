const koffi = require('koffi');

const CELERY_BIN_URL = 'https://raw.githubusercontent.com/static-archives/Celery/main/update/CeleryIn.bin';
const CELERY_INJECTOR_URL = 'https://raw.githubusercontent.com/static-archives/Celery/main/update/CeleryInject.exe';
const CELERY_VERSION_URL = 'https://raw.githubusercontent.com/static-archives/Celery/main/update/version.txt';

const user32 = koffi.load('user32.dll');

const user32Functions = {
    FindWindowA: user32.func('int FindWindowA(const char* lpClassName, const char* lpWindowName)'),
    ShowWindow: user32.func('bool ShowWindow(int hWnd, int nCmdShow)'),
    MessageBoxA: user32.func('int MessageBoxA(int hWnd, const char* lpText, const char* lpCaption, uint32 uType)'),
    SetPropA: user32.func('bool SetPropA(int hWnd, const char* lpString, int hData)'),
};

module.exports = {
    user32Functions,
    CELERY_BIN_URL,
    CELERY_INJECTOR_URL,
    CELERY_VERSION_URL
};
