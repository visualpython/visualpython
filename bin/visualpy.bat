@echo off
SetLocal
rem #==========================================================================
rem # Filename : visualpy.bat
rem # function : control Visual Python for windows
rem # Creator  : BlackLogic - LJ
rem # version  : 2.2
rem # License  : GPLv3
rem # Date     : 2020 07.30
rem # MDate    : 2020 07.20
rem #==========================================================================

rem ## setting variables

set v_pip=pip
where pip3 > nul 2>&1 && set v_pip=pip3

set v_prod=visualpython
(echo "%v_prod%" & echo.) | findstr /O . | more +1 | (set /P RESULT= & call exit /B %%RESULT%%)
set /A v_prd_length=%ERRORLEVEL%-5
set v_option=%1
for /f "delims=, tokens=1*" %%i in ('%v_pip% show %v_prod% 2^>^&1 ^| find "Location"') do (
set v_1=%%i)
set v_path1=%v_1:~10%
set v_str1=jupyter nbextension
set v_str2=%v_prod%/src/main
set v_srch=%v_pip% search %v_prod%
set v_upgr=pip install %v_prod% --upgrade
set v_unst=%v_pip% uninstall %v_prod%
set v_ckup=%v_pip% list -o
set v_show=%v_pip% show %v_prod%

rem check env & setting path2
where /q conda-env
IF ERRORLEVEL 1 (
    call :l_prt_be_line
    ECHO Not a conda env.
    set v_path2=%APPDATA%\jupyter\nbextensions\
) ELSE (
    call :l_prt_be_line
    ECHO conda env.
    set v_path2=%v_path1:~,-18%\share\jupyter\nbextensions\
)

rem ## Main Block
:l_main
    IF /i "%v_option%"=="" goto :l_help

    for %%i in (-h help)           do if /i %v_option% == %%i call :l_help
    for %%i in (-e enable)         do if /i %v_option% == %%i call :l_enable
    for %%i in (-d disable)        do if /i %v_option% == %%i call :l_disable
    for %%i in (-i install)        do if /i %v_option% == %%i call :l_install
    for %%i in (-up upgrade)       do if /i %v_option% == %%i call :l_upgrade
    for %%i in (-v version)        do if /i %v_option% == %%i call :l_version
    for %%i in (-ce checkext)      do if /i %v_option% == %%i call :l_check_extension
    for %%i in (-cb checkbpl)      do if /i %v_option% == %%i call :l_check_visualpython
    for %%i in (-un uninstall)     do if /i %v_option% == %%i goto :l_uninstall
    goto :eof

rem ## Function Block
:l_help
    echo.
    echo usage: visualpy option
    echo optional arguments:
    echo  -h,  help        show this help message and exit
    echo  -e,  enable      enable Visual Python
    echo  -d,  disable     disable Visual Python
    echo  -i,  install     install Visual Python extensions
    echo  -un, uninstall   uninstall Visual Python packages
    echo  -up, upgrade     upgrade Visual Python Package
    echo  -v,  version     show Visual Python current version
    echo.
    goto :eof

:l_check_extension
    IF NOT EXIST "%v_path2%" call :l_prt_extensiondir
    goto :eof

:l_check_visualpython
    IF EXIST "%v_path2%%v_prod%" (
            set v_flag=1
        ) ELSE (
            set v_flag=2
        )
    goto :eof

:l_install
	rem "" is for envname with space.
    IF EXIST "%v_path2%%v_prod%" ( call :l_prt_be_line
                                   echo Check installed %v_prod% Path :
                                   echo %v_path2%%v_prod%
                                   call :l_prt_visualpythondir
								   call :l_overwrite
    ) ELSE ( call :l_copy_files
             call :l_enable
    )
    goto :eof

:l_enable
    call :l_prt_be_line
    %v_str1% enable %v_str2%
    call :l_prt_af_line
    goto :eof

:l_disable
    call :l_prt_af_line
    %v_str1% disable %v_str2%
    call :l_prt_af_line
    goto :eof

:l_overwrite
    rem if visaulpython 없는경우 install로 수행
    rem else remove & install
    call :l_disable
    call :l_remove_files
    call :l_copy_files
    call :l_enable
    goto :eof

:l_copy_files
    call :l_prt_be_line
    echo source : %v_path1%\%v_prod%\
    rem "" is for envname with space.
    xcopy /q /y /e "%v_path1%\%v_prod%" "%v_path2%%v_prod%\"
    echo target : %v_path2%%v_prod%\
    call :l_prt_af_line
    goto :eof

:l_remove_files
    call :l_prt_be_line
    echo Remove Visual Python Directories.
    rem "" is for envname with space.
    rmdir /s /q "%v_path2%%v_prod%"
    call :l_prt_af_line
    goto :eof

:l_upgrade
    call :l_prt_af_line
    echo Running upgrade visualpython.	
    call :l_prt_af_line	
	rem setting current version
	for /f "tokens=*" %%i in ( '%v_show% 2^>^&1 ^| findstr /i Version') do (
	set v_currentver=%%i
	)
	
	rem running version upgrade
	%v_upgr%
	
	rem setting last installed version
	for /f "tokens=*" %%i in ( '%v_show% 2^>^&1 ^| findstr /i Version') do (
	set v_lastver=%%i
	)
	set v_install=   Installed %v_currentver%
	set v_last=Last Release %v_lastver%
	
    call :l_prt_af_line
	
	if not %v_lastver:~9% == %v_currentver:~9% (
	    echo change visualpython extension files ...
        call :l_disable
        call :l_copy_files
        call :l_enable
	) else (
	    echo Already installed last Visual Python version.
		call :l_print_version
	)
    goto :eof
		
:l_version
    rem call :l_prt_be_line
    
	for /f "tokens=*" %%i in ('%v_ckup% 2^>^&1 ^|  find /i "%v_prod%"') do ( set v_info=%%i )

	if "%v_info%."=="." ( 
	     rem pass upgrade
		 for /f "tokens=*" %%i in ( '%v_show% 2^>^&1 ^| findstr /i Version') do ( set v_last=%%i 

		 set  v_last=Last Release %%i
		 set  v_install=   Installed %%i
		 set  v_ver_flag=0		 
	      ) 
	) else ( 
	     rem run upgrade
         for /f "tokens=2-3" %%i in ( 'echo %v_info%' ) do (
                                                            rem echo Last release Version : %%j 
                                                            rem echo Installed Version    : %%i 
                                                            set  v_install=   Installed Version: %%i
                                                            set  v_last=Last Release Version: %%j
                                                            set  v_ver_flag=1 
														) 
	)
	call :l_print_version
    goto :eof

:l_print_version
    call :l_prt_af_line
	echo %v_install%
	echo %v_last%
    call :l_prt_af_line
	rem echo %v_flag%
    goto :eof	

:l_prt_extensiondir
    call :l_prt_be_line
    echo Nbextension not activated
    echo Plz install nbextension
    call :l_prt_af_line
    goto :eof

:l_prt_visualpythondir
    call :l_prt_af_line
    echo Already exists Visual Python.
    goto :eof

:l_prt_notexists_visualpythondir
    call :l_prt_be_line
    echo Visual Python extension not installed.
    call :l_prt_af_line
    goto :eof

:l_prt_be_line
    echo.
    echo ==========================================================================================
    goto :eof

:l_prt_af_line
    echo ==========================================================================================
    goto :eof

:l_prt_line
    echo ------------------------------------------------------------------------------------------
    goto :eof


:l_uninstall
    IF EXIST "%v_path2%%v_prod%" (
        call :l_disable
        call :l_remove_files
        echo "%v_path2%%v_prod%"
        call :l_prt_af_line
        %v_unst%
    ) else (
        call :l_prt_be_line
        echo %v_path1:~,-18%\share\jupyter\nbextensions\
        echo %v_path2%%v_prod%
        call :l_prt_af_line
        %v_unst%
    )

rem #==========================================================================
rem #End of File
rem #==========================================================================
EndLocal