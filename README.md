# Visual Python
[![PyPI version shields.io](https://img.shields.io/pypi/v/visualpython)](https://pypi.python.org/pypi/visualpython/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-green)](https://www.gnu.org/licenses/gpl-3.0.html)
[![Code of Conduct: Contributor Covenant](https://img.shields.io/badge/Code%20of%20Conduct-Contributor%20Covenant-blueviolet)](https://github.com/visualpython/visualpython/blob/main/CODE_OF_CONDUCT.md)

## Introduction
Visual Python is a GUI-based Python code generator, developed on the Jupyter Notebook environment as an extension. 

<img src="https://i.esdrop.com/d/7o0dj05m8rnz/sgKUVlLpRx.png" width="85%">

1. Key Features 
* Automatically generates Python code based on a graphic user interface <br>
* Creates code blocks by tasks (such as data processing, visualization) <br>
* You can save the analysis process and share it (as .vp file) with others <br>

2. Who and What is it for? <br>
Visual Python is a data analytics solution for both Programmers & Non-programmers. <br>

Programmers can use the tool : <br> 
* to save & reuse user-defined (or repeatedly used) code <br>
* to find Python packages and functions from the list <br>

Non-programmers will be able to : <br>
* learn the Python language more easily <br>
* manage big data with minimal coding skills <br>


## Getting Started

### 1. Requirements

Visual Python is developed as an extension on Jupyter Notebook. <br>
We recommend installing Anaconda (virtual environment).

- Python version 3.x
- Jupyter notebook or Anaconda env <br>

### 2. How to Install

**1)  Open Anaconda prompt**

* Windows : Click Start > Search or Select 'Anaconda Prompt' <br>
* Mac : Open Launchpad > Select 'Terminal'

**2)  Install package from**
```
pip install visualpython
```
<br>

Depending on your virtual environment settings, you may need to install Jupyter Extensions.<br>
To install Jupyter Extension, use commands either:
```
pip install jupyter_contrib_nbextensions
```
or <br>
```
conda install -c conda-forge jupyter_contrib_nbextensions
```

**3)  Enable the package**
```
visualpy install
```

**4)  Activate Visual Python on Jupyter Notebook**

Click orange square button on the right side of the Jupyter Notebook menu. <br>

### 3. Package Control Info
* Usage: visualpy **[option]** <br>
* Optional arguments:

```
help       - show help menu
uninstall  - uninstall packages
upgrade    - version upgrade
version    - version check
```


## Mission & Vision
**Mission** <br>
To support technology and education so that anyone can leverage big data analytics to create a variety of social values.

**Vision** <br>
To create an environment where everyone can learn and use big data analytics skills easily.

## Contributing
If you are interested in contributing to the Visual Python, please see [`CONTRIBUTING.md`](CONTRIBUTING.md). <br>
All skills from programmers, non-programmers, designers are welcomed.

## License
GNU GPLv3 (See LICENSE file).
