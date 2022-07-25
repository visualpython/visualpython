# Reshape DataFrames

{% embed url="https://www.youtube.com/watch?t=13s&v=cjUbH88McTA" %}

### To reshape DataFrames

1. Click on the <mark style="color:green;">**Reshape**</mark> app.
2. Select DataFrame to reshape.
3. Select the method:

{% hint style="info" %}
* <mark style="color:green;">**Pivot**</mark>: to transform the data from long to wide.
* <mark style="color:green;">**Melt**</mark>:  to transform the data from wide to long.
{% endhint %}

#### **Pivot**

1. Select a column to use to make new DataFrame's index. _If not specified, it uses existing index._&#x20;
2. Select a column to use to make new DataFrame's columns.
3. Select column(s) to use for populating new DataFrame's values. _If not specified, it uses all columns._
4. and click <mark style="color:green;">**Run**</mark> !

![](<../../.gitbook/assets/image (11).png>)

**Melt**&#x20;

1. Select column(s) to use as identifier variables.
2. Select column(s) to unpivot. _If not specified, it uses all columns._
3. Assign to a new variable.
4. and, click <mark style="color:green;">**Run**</mark> !

![](<../../.gitbook/assets/image (15).png>)

****

