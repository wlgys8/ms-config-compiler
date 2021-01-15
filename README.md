# ms-config-compiler

通过预处理，将特定格式的excel配置表，转换为二进制数据和数据模型代码。 供运行时快速加载和读取。

# Warning 
项目处于开发中，功能接口可能不稳定

# Install

通过如下命令，全局安装命令行`msconfig`

```
npm install git+https://github.com/wlgys8/ms-config-compiler.git -g
```

# Usage


## Hello World

- 在命令行输入`msconfig helloworld`
- 工具会在当前目录下，生成一份标准格式的excel配置文件`TestConfig.xlsx`，并对其进行编译，编译结果输出到`out`文件夹中


## Detail Usage 

利用`msconfig gen`命令来编译excel配置文件，并自动生成相关数据文件和解析代码。

命令行参数如下:

```
Usage: msconfig gen [options]

Options:
  -s,--src <srcDir>                     src config files dir
  -o,--code-out <codeOutDir>            code files output dir
  -d,--data-out <dataOutDir>            data files out dir
  -c,--options-file <extraOptionsFile>  extra options
  -m,--merge                            merge all data files into one bianry file
  -h, --help                            display help for command

```


- merge

如果有多个excel配置表，采用merge模式，会把所有配置的数据合并到一个二进制文件中，并额外生成一份mergeManifest.json索引文件

- extraOptionsFile

extraOptionsFile是用来作支持类型扩展的。


# 配置表规范

配置表一般遵循如下的结构

||c1|c2|c3|c4|c5|
|---|---|---|---|---|---|
|r1|namespace|{namespace}|   |fieldName1|fieldName2|...|
|r2|tableName|{tableName}|   |fieldType1|fieldType2|...|
|r3|         |           |   |comment1  |comment2  |...|
|r4|         |           |   |value11   |value21   |...|
|r5|         |           |   |value12   |value22   |...|
|r6|         |           |   |value13   |value23   |...|

</br>
</br>

其中c1与c2两列，分别构成了表头的Key与Value，记录了表的元信息。目前支持的配置字段如下:

- namespace 

    表命名空间，生成的代码、代码路径、数据文件路径均会采用此命名空间.

- tableName

    表名。决定了生成的类名和数据文件名字。

- contentOffset

    数据字段开始的行。默认为2.

- keys

    表的键字段名。支持联合键。以|进行分割

<br/>

从c4列开始,为表的字段与数据部分. 
其中:
- r1行，为字段名字
- r2行，为字段类型
- r3行，为注释
- r4行，开始为数据项

### 字段名

- 字段名需要符合一般代码中的字段名规则
- 字段名前加#表示此列不导出

### 数据类型

- 当前支持的基础数据类型如下:

    ```
    UInt8,
    UInt16,
    UInt32,
    UInt64,
    Int8,
    Int16,
    Int32,
    Int64,
    Single,
    Double,
    Bool,
    String,

    ```

- 当前支持的结构数据类型如下：

    ```
    Vector2,
    Vector3,
    Rect,
    RectOffset,
    Color
    ```

    结构数据类型，均采用`|`来分割元素.


- 当前支持的集合类型，仅有List

    List只支持基础数据类型。目前支持二级嵌套
    

    例如:

    - c#中的`List<byte>`类型，在csv中可以定义为`List<UInt8>`
    - c#中的`List<List<byte>>类型`,在csv中可以定义为`List2<UInt8>`

    一级分隔符为`|`,二级分隔符为`&`

    那么对于 `List2<UInt8>`类型的字段，我们配置值的时候，可以按如下配置: `0&1|2&3`

