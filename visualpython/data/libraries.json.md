# Libaries.json README
## Item Format
### for function
{
    "_comment": "comments if needed",
    "id"   : "**com**_sample",
    **"type" : "function",**
    "level": 0~n,
    "name" : "Function name to display",
    "tag"  : "Tag for searching this function",
    "path" : "visualpython - common - path",
    "desc" : "Description about this function",
    "file" : "file_path.js"
}
### for Package
{
    "_comment": "comments if needed",
    "id"   : "**pkg**_sample",
    **"type" : "package",**
    "level": 0~n,
    "name" : "Package name to display",
    ------ no **"tag"** ------------------------------
    "path" : "visualpython - common - path",
    "desc" : "Description about this function",
    **"item"** : [
        ... package functions here
    ]
}

## Item Format Details
### id

### type

### level

### name

### tag

### path

### desc

### file

### item