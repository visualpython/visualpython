#
#    Project Name    : Visual Python
#    Description     : GUI-based Python code generator
#    File Name       : build.colab.sh
#    Author          : Black Logic - Minju
#    Note            : Build Visual Python for Colab
#    License         : GPLv3 (GNU General Public License v3.0)
#    Date            : 2023. 02. 08
#    Change Date     :
#

# set visualpython version
export VP_ORG_VER=2.2.12
export VP_NEW_VER=2.2.13

# make directories to save build output
mkdir -p ../dist/colab

# update version info
# rsync -av --exclude='path1/in/source' --exclude='path2/in/source' [source]/ [destination]
rm -rf ../dist/colab/visualpython-v$VP_NEW_VER/*
rsync -avk --exclude='./build.colab.sh' ../colab/ ../dist/colab/visualpython-v$VP_NEW_VER/
grep -REil ${VP_ORG_VER//\./\\.} setup.py visualpython/* | xargs sed -i --follow-symlinks "s/${VP_ORG_VER//\./\\.}/${VP_NEW_VER}/g"

# build package
zip -r ../dist/colab/visualpython-v$VP_NEW_VER.zip background.js content.js icon.png inject.js manifest.json visualpython

exit 0
# End of file
