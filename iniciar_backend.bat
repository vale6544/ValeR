@echo off 
cd /d C:\rosas-monitor 
call venv\Scripts\activate 
uvicorn main:app --host 0.0.0.0 --reload 
