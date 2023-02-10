#
#    Project Name    : Visual Python
#    Description     : GUI-based Python code generator
#    File Name       : build.jupyternotebook.sh
#    Author          : Black Logic - Minju
#    Note            : Build Visual Python for Jupyter Notebook
#    License         : GPLv3 (GNU General Public License v3.0)
#    Date            : 2023. 02. 08
#    Change Date     :
#
export VP_ORG_VER=2.2.12
export VP_NEW_VER=2.2.13
export CH_DT=`date "+%Y.%m.%d"`

# update version info
grep -REil ${VP_ORG_VER//\./\\.} setup.py visualpython/* | xargs sed -i --follow-symlinks "s/${VP_ORG_VER//\./\\.}/${VP_NEW_VER}/g"

find visualpython -depth -type d | grep -v 'git' | awk '{printf "echo \"print('\''Visual Python'\'')\" > %s/__init__.py\n", $1}' | sh

sed -i -e --follow-symlinks 's/\r$//' visualpython/bin/visualpy

# make dir
mkdir -p ../dist/jupyternotebook

# build
python setup.py sdist bdist_wheel # TODO: set output dir

# upload pypi # FIXME: uploading is only permissioned to maintainer
# python -m twine upload ../dist/jupyternotebook/*

exit 0
# End of file
