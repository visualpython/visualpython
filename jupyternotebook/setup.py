# coding: utf-8
import os

from setuptools import setup, find_packages
from pathlib import Path
this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()

name = 'visualpython'

setup(
    name             = name,
    version          = '2.3.3',
    packages         = find_packages(),
    package_data     = {"": ["*"], 'visualpython' : ['visualpython.yaml', 'README.md']},
    scripts          = ['visualpython/bin/visualpy', 'visualpython/bin/visualpy.bat'],
    description      = 'Visual Python is a GUI-based Python code generator, developed on the Jupyter Notebook as an extension.',
    long_description_content_type = 'text/markdown',
    long_description = long_description,
    author           = 'Black Logic Co.,Ltd.',
    author_email     = 'blacklogic.dev@gmail.com',
    url              = 'https://github.com/visualpython/visualpython',
    license          = 'GPLv3',
    install_requires = [],
    platforms        = "Linux, Mac OS X, Windows",
    keywords         = ['VisualPython', 'visualpython', 'visual python', 'Visual Python', 'Visual', 'visual'],
    python_requires  = '>=3.6',
)
