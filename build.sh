#
#    Project Name    : Visual Python
#    Description     : GUI-based Python code generator
#    File Name       : build.sh
#    Author          : Black Logic - Minju
#    Note            : Build Visual Python for All
#    License         : GPLv3 (GNU General Public License v3.0)
#    Date            : 2023. 02. 08
#    Change Date     :
#
TEMP_PWD=$PWD

#=============================================================================
# Build Visual Python for Colab
#=============================================================================
cd $TEMP_PWD/colab
./build.colab.sh

#=============================================================================
# Build Visual Python for Jupyter Notebook
#=============================================================================
cd $TEMP_PWD/jupyternotebook
./build.jupyternotebook.sh

#=============================================================================
# Build Visual Python for Jupyter Lab
#=============================================================================
cd $TEMP_PWD/jupyterlab
./build.jupyterlab.sh

exit 0

# End of file
