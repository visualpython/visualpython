# Installing FAQ

### Which web browsers does Visual Python support?

{% hint style="info" %}
Visual Python may work on many up-to-date browsers but it is optimized for Chrome.
{% endhint %}

### I installed Visual Python, but the orange button does not appear on my Jupyter Notebook.

This can happen if the you're using a Python version is not 3.x.&#x20;

1. Please upgrade to Python 3.x, or
2. If you are using multiple versions of Python, specify the pip version as 3 using the following command:

**NOTE:** Please uninstall before reinstalling.&#x20;

```
pip uninstall visualpython
```

```
visualpy install —pip3
```

### How can I install Visual Python behind a corporate firewall?

If pip installation gives you SSLError, it can be solved using the following command:

```
pip install visualpython --trusted-host pypi.org --trusted-host files.pythonhosted.org
```

To upgrade Visual Python in the same environment, follow the steps below.

**1) Upgrade Visual Python package.**

```
pip install visualpython --upgrade --trusted-host pypi.org --trusted-host files.pythonhosted.org 
```

**2) Enable the package.**

```
visualpy install
```



