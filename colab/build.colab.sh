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
#=============================================================================
# Replace Version
#=============================================================================
VP_ORG_VER=2.2.12
VP_NEW_VER=2.3.0

# update version info
# update manifest version with new numbering for new version
grep -REil ${VP_ORG_VER//\./\\.}\.[0-9] manifest.json | xargs sed -i "s/${VP_ORG_VER//\./\\.}\.[0-9]/${VP_NEW_VER}.1/g"
# update version inside visualpython package
grep -REil ${VP_ORG_VER//\./\\.} visualpython/* | xargs sed -i --follow-symlinks "s/${VP_ORG_VER//\./\\.}/${VP_NEW_VER}/g"

#=============================================================================
# Build output for Colab
#=============================================================================
# make directories to save build output
mkdir -p ../dist/colab

# build package
# sudo apt-get install zip
zip -r ../dist/colab/visualpython-v$VP_NEW_VER.zip background.js content.js icon.png inject.js manifest.json visualpython

exit 0
# End of file
