@echo off 
start iniciar_backend.bat 
timeout /t 3 /nobreak >nul 
start iniciar_dashboard.bat 
#timeout /t 5 /nobreak >nul 
#start http://127.0.0.1:8000/docs 
#start http://localhost:5173 
