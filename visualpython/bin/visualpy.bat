@echo off
SetLocal
rem #
rem #    Project Name    : Visual Python
rem #    Description     : GUI-based Python code generator
rem #    File Name       : visualpy.bat
rem #    Author          : Black Logic - LJ
rem #    Note            : Control Visual Python for windows
rem #    License         : GPLv3 (GNU General Public License v3.0)
rem #    Date            : 2021. 08. 14
rem #    Change Date     :
rem #

rem #=========================================================================
rem # Check Arguments
rem #   - set VP_OPTION & PIP_T
rem #=========================================================================
set argc=0
for %%x in (%*) do Set /a argc+=1

if %argc% == 1 (
    set VP_OPTION=%1
) else if %argc% == 2 (
    set ARG1=%1
    set ARG2=%2
) else (
    set VP_OPTION=
)

if %argc% == 2 (
    if "%ARG1:~0,2%" == "--" (
        set VP_OPTION=%ARG2%
        set PIP_T=%ARG1:~2%
    ) else (
        set VP_OPTION=%ARG1%
        set PIP_T=%ARG2:~2%
    )
)

rem #=========================================================================
rem # Set variable
rem #=========================================================================
set PIP=pip
where %PIP_T% > nul 2>&1 && set PIP=%PIP_T%

set JP_NB=jupyter nbextension

set VP_NAME=visualpython
set VP_BIND=visualpython/visualpython

set PIP_UNINST=%PIP% uninstall %VP_NAME%
set PIP_UPGRAD=%PIP% install %VP_NAME% --upgrade

rem #=========================================================================
rem # main block
rem #=========================================================================
:f_main
    echo Package install command: %PIP%

    IF /i "%VP_OPTION%"=="" goto :f_help
    for %%i in (-v version)        do if /i %VP_OPTION% == %%i goto :f_version
    for %%i in (-h help)           do if /i %VP_OPTION% == %%i goto :f_help

    call :f_get_string_pipshow RES Location
    set PATH_SRC=%RES%

    call :f_get_extension_path RES
    set PATH_DST=%RES%

    for %%i in (-e enable)         do if /i %VP_OPTION% == %%i goto :f_enable
    for %%i in (-d disable)        do if /i %VP_OPTION% == %%i goto :f_disable
    for %%i in (-i install)        do if /i %VP_OPTION% == %%i goto :f_install
    for %%i in (-un uninstall)     do if /i %VP_OPTION% == %%i goto :f_uninstall
    for %%i in (-up upgrade)       do if /i %VP_OPTION% == %%i goto :f_upgrade

    goto :f_help

    goto :eof

rem #=========================================================================
rem # Install Visual Python
rem #=========================================================================
:f_install
    if not exist "%PATH_DST%" (
        mkdir "%PATH_DST%"
    )

    call :f_check_extension RES
    rem # 1 = Jupyter Extension is not actived
    rem # 2 = visualpython does not exist
    rem # 3 = visualpython exists

    if %RES% == 1 (
        call :f_print_not_extension
    ) else if %RES% == 2 (
        call :f_copy_files
        call :f_enable
    ) else if %RES% == 3 (
        rem # overwrite
        call :f_print_line1
        echo Already exists Visual Python.
        call :f_print_line1

        call :f_disable
        call :f_remove_files
        call :f_copy_files
        call :f_enable
    )

    goto :eof

rem #=========================================================================
rem # Uninstall Visual Python
rem #=========================================================================
:f_uninstall
    call :f_check_extension RES
    rem # 1 = Jupyter Extension is not actived
    rem # 2 = visualpython does not exist
    rem # 3 = visualpython exists

    if %RES% == 2 (
        call :f_print_line2
        %PIP_UNINST%
        call :f_print_line2
    ) else if %RES% == 3 (
        call :f_print_line1
        call :f_disable
        call :f_print_line2
        call :f_remove_files
        call :f_print_line2
        %PIP_UNINST%
        call :f_print_line1
    )

    goto :eof

rem #=========================================================================
rem # Upgrade Visual Python
rem #=========================================================================
:f_upgrade
    call :f_print_line1
    echo Running upgrade Visual Python
    call :f_print_line2

    rem # Get Visual Python version
    call :f_get_string_pipshow RES Version
    set VP_VERSION=%RES%

    %PIP_UPGRAD%

    rem # Get Visual Python new version
    call :f_get_string_pipshow RES Version
    set VP_VERSION_NEW=%RES%

    if "%VP_VERSION%" == "%VP_VERSION_NEW%" (
        call :f_print_line2
        echo Already installed last Visual Python version.
        call :f_print_line2
        echo Installed version    : %VP_VERSION%
        echo Last Release version : %VP_VERSION_NEW%
        call :f_print_line1
    ) else (
        call :f_print_line2
        call :f_disable
        call :f_remove_files
        call :f_copy_files
        call :f_enable
        call :f_print_line1
    )

    goto :eof

rem #=========================================================================
rem # Enable Visual Python
rem #=========================================================================
:f_enable
    call :f_check_extension RES
    if %RES% == 3 %JP_NB% enable %VP_BIND%

    goto :eof

rem #=========================================================================
rem # Disable Visual Python
rem #=========================================================================
:f_disable
    call :f_check_extension RES
    if %RES% == 3 %JP_NB% disable %VP_BIND%

    goto :eof

rem #=========================================================================
rem # Visual Python version
rem #=========================================================================
:f_version
    call :f_get_string_pipshow RES Version
    set VP_VERSION=%RES%
    echo Visual Python %VP_VERSION%

    goto :eof

rem #=========================================================================
rem # Help messages
rem #=========================================================================
:f_help
    echo.
    echo usage: visualpy [option] [--pip3]
    echo.
    echo optional arguments:
    echo   -h,  help       show this help message and exit
    echo   -e,  enable     enable Visual Python
    echo   -d,  disable    disable Visual Python
    echo   -i,  install    install Visual Python extensions
    echo   -ui, uninstall  uninstall Visual Python packages
    echo   -up, upgrade    upgrade Visual Python Package
    echo   -v,  version    show Visual version and exit
    echo.
    echo   --pip3          use pip3 [default: pip]
    echo. 

    goto :eof

rem #=========================================================================
rem # Copy Visual Python files
rem #=========================================================================
:f_copy_files
    call :f_print_line1
    echo Copy visualpython extension files ...
    call :f_print_line2
    echo Source Dir : %PATH_SRC%\%VP_NAME%
    echo Target Dir : %PATH_DST%\%VP_NAME%
    call :f_print_line1
    xcopy /q /y /e "%PATH_SRC%\%VP_NAME%" "%PATH_DST%\%VP_NAME%\"

    goto :eof

rem #=========================================================================
rem # Remove Visual Python files
rem #=========================================================================
:f_remove_files
    call :f_print_line1
    echo Remove Visual Python Directories.
    rmdir /s /q "%PATH_DST%\%VP_NAME%"

    goto :eof

rem #=========================================================================
rem # Check Visual Python files
rem #   1 = Jupyter Extension is not actived
rem #   2 = visualpython does not exist
rem #   3 = visualpython exists
rem #=========================================================================
:f_check_extension
    if not exist "%PATH_DST%" (
        set %~1=1
    ) else if not exist "%PATH_DST%\%VP_NAME%" (
        set %~1=2
    ) else (
        set %~1=3
    )

    goto :eof

rem #=========================================================================
rem # Get string(Version or Location) from pip show
rem #   %~2 = Version or Location
rem #=========================================================================
:f_get_string_pipshow
    set BUF1=
    set RESULT=EMPTY

    for /f "delims=: tokens=1*" %%i in ('%PIP% show %VP_NAME% 2^>^&1 ^| find "%~2"') do (set BUF1=%%j)

    set RESULT=%BUF1: =%
    set %~1=%RESULT%

    goto :eof

rem #=========================================================================
rem # Get string(Jupyter nbextension path) from conda-env or jupyter
rem #=========================================================================
:f_get_extension_path
    set BUF1=
    set BUF2=
    set RESULT=EMPTY

    where /q conda-env
    if "%ERRORLEVEL%" == "0" (
        for /f "delims=* tokens=2" %%i in ('conda-env list 2^>^&1 ^| find "*"') do (set BUF1=%%i)
    ) else (
        for /f "tokens=*" %%i in ('jupyter --data-dir') do (set BUF2=%%i)
    )

    if not "%BUF1%" == "" (
        set RESULT=%BUF1: =%\share\jupyter\nbextensions
    ) else (
        set RESULT=%BUF2: =%\nbextensions
    )
    set %~1=%RESULT%

    goto :eof

rem #=========================================================================
rem # Print extension is not installed
rem #=========================================================================
:f_print_not_extension
    echo Jupyter nbextension is not activated
    echo Please install Jupyter nbextension
    call :f_print_line1
    echo for conda env
    echo conda install -c conda-forge jupyter_contrib_nbextensions
    echo jupyter contrib nbextension install --user
    call :f_print_line2
    echo for pip
    echo %PIP% install -e jupyter_contrib_nbextensions
    echo jupyter contrib nbextension install --user
    call :f_print_line1

    goto :eof

rem #=========================================================================
rem # Print line
rem #=========================================================================
:f_print_line1
    echo ==========================================================================================
    goto :eof

:f_print_line2
    echo ------------------------------------------------------------------------------------------
    goto :eof

rem #=========================================================================

rem # End of file

EndLocal
