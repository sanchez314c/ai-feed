@echo off
REM Run theFEED from Compiled Binary - Windows
REM Launches the compiled application from dist folder

setlocal enabledelayedexpansion

REM Configuration
set APP_NAME=theFEED

REM Get the script directory
cd /d "%~dp0\.."

REM Colors for output (Windows 10+)
echo [94m[%TIME:~0,8%][0m Launching compiled theFEED application...

REM Check if dist directory exists
if not exist "dist" (
    echo %RED%[%TIME%] X%NC% No dist/ directory found. Please run compile-build-dist.sh first.
    echo.
    echo Build the application first using:
    echo   - Git Bash: ./compile-build-dist.sh
    echo   - WSL: ./compile-build-dist.sh
    echo   - PowerShell with WSL: wsl ./compile-build-dist.sh
    pause
    exit /b 1
)

REM Find the executable
set "APP_PATH="

REM Check for unpacked executable first (faster launch)
if exist "dist\win-unpacked\Video Transcriber.exe" (
    set "APP_PATH=dist\win-unpacked\Video Transcriber.exe"
    echo %BLUE%[%TIME%]%NC% Found unpacked executable: Video Transcriber.exe
    goto :found
)

REM Check for any exe in win-unpacked
if exist "dist\win-unpacked\*.exe" (
    for %%F in (dist\win-unpacked\*.exe) do (
        set "APP_PATH=%%F"
        echo %BLUE%[%TIME%]%NC% Found unpacked executable: %%~nxF
        goto :found
    )
)

REM Check for installer
if exist "dist\*.exe" (
    for %%F in (dist\*.exe) do (
        REM Skip blockmap files
        echo %%F | findstr /C:".blockmap" >nul
        if errorlevel 1 (
            set "APP_PATH=%%F"
            echo %YELLOW%[%TIME%] !%NC% Found installer: %%~nxF
            echo %YELLOW%[%TIME%] !%NC% Note: This will install the application
            goto :found
        )
    )
)

REM No executable found
echo %RED%[%TIME%] X%NC% Could not find executable in dist/ directory
echo.
echo %YELLOW%[%TIME%] !%NC% Available files in dist/:
dir dist /b
echo.
echo To build the app first, run:
echo   - Git Bash: ./compile-build-dist.sh
echo   - WSL: ./compile-build-dist.sh
pause
exit /b 1

:found
REM Launch the application
echo %GREEN%[%TIME%] OK%NC% Launching Video Transcriber...
start "" "!APP_PATH!"

echo %GREEN%[%TIME%] OK%NC% Application launched successfully!
echo The app is now running
pause