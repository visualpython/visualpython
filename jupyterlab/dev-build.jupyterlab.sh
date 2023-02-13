#
#    Project Name    : Visual Python
#    Description     : GUI-based Python code generator
#    File Name       : dev-build.jupyterlab.sh
#    Author          : Black Logic - Minju
#    Note            : Dev-Build Visual Python for Jupyter Lab
#    License         : GPLv3 (GNU General Public License v3.0)
#    Date            : 2023. 02. 08
#    Change Date     :
#
# cp current core source code
rm -rf lib/visualpython
cp -r ../visualpython lib/visualpython

# convert text-loader, raw-loader, css-loader
grep -rl "vp_text_loader" lib/visualpython/js/* | xargs sed -i "s/vp_text_loader('\(.\+\)')\(.\+$\)/'!!text-loader!\1'\2/g"
grep -rl "vp_raw_loader" lib/visualpython/js/* | xargs sed -i "s/vp_raw_loader('\(.\+\)')\(.\+$\)/'\1'\2/g"
grep -rl "vp_css_loader" lib/visualpython/js/* | xargs sed -i "s/vp_css_loader('\(.\+\)')\(.\+$\)/'\1.css'\2/g"

# run build as static files
# npm install   # install npm package dependencies
# npm run build  # optional build step if using TypeScript, babel, etc.
# jupyter labextension install  # install the current directory as an extension
jlpm run build