@echo off
title Ares Command - Local Offline AI Setup (Qwen 2.5 7B)
color 0C

echo ======================================================================
echo           ARES COMMAND // ASTRONAUT FIELD AI SETUP
echo        Local Offline Quantized Intelligence Engine (Qwen 2.5 7B)
echo ======================================================================
echo.
echo Checking for Ollama installation...
where ollama >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [!] Ollama is not detected in system PATH.
    echo.
    echo Please install Ollama from: https://ollama.com/download
    echo After installation, rerun this script.
    echo.
    pause
    exit /b 1
)

echo [+] Ollama detected!
echo [+] Pulling high-speed quantized model: qwen2.5:7b-instruct ...
echo.
ollama pull qwen2.5:7b-instruct

echo.
echo ======================================================================
echo [+] Model download complete! Starting local AI server...
echo [+] Local API endpoint: http://localhost:11434/v1
echo [+] Keep this window open or minimized during offline field operations.
echo ======================================================================
echo.
ollama run qwen2.5:7b-instruct
pause
