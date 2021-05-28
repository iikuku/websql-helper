# db类
	这个是我参照thinkphp的玩法，封装的一个websql操作类，支持链式操作

## 操作某个表
	db("表名")

## 建表
	db("表名").createTable({
		"字段名1":"字段类型1",
		"字段名2":"字段类型2"
		....
	})

## 删表
db("表名").dropTable()

## 记录-增
	db("表名").data(键值对).insert();

	例如:
	db("表名").data({
			"字段名1":"值1",
			"字段名2":"值2"
			...
		}).insert()


## 记录-删
	删全表记录 
	db("表名").delete()  

	根据条件删记录 
	db("表名").where(条件).delete() 

	当然，也可以加入 limit 和 order，这就是链式操作的魅力 
	db("表名").where(条件).order('date desc').limit(1).delete() 

## 记录-改
	基本同上
	db("表名").where(条件).data(键值对).update()

## 记录-查
	基本同上，也支持链式操作
	db("表名").where(条件).select(function(tx,data){
		//data就是查到的数据
	});

## .field( ) 方法
	db("cars").where({"id":1}).select()
	这个默认执行的是 
	select * from cars where id=1

	如果表字段比较多，不想查全字段或者有其他需求，可以用field方法指定想查的字段
	db("cars").field("id,chepai").where({"id":1}).select()
	这个执行的是 
	select id,chepai from cars where id=1
	当然，也可以这样
	db("cars").field(" *, id+cash as all_money ").where({"id":1}).select()

## .group( ) 方法
	例如分组统计数量
	db("cars").field("dest,count(*) as c").group("dest").select()
	这个执行的是
	select dest,count(*) as c from cars group by dest

## .limit( ) 方法
	查10条
	db("cars").limit(10).select();
	查第2到第5条
	db("cars").limit("2,5").select();

## .where( ) 方法
	db("cars").where(条件).select()
	
	条件通常是键值对，特殊之处在于， 我设置了一个 _logic 保留字段，
	默认情况下多条件之间是用and组合的，可以用 _logic 指定为or
	而键值对默认是用等号，如果有其他特殊需求，可以参考以下cash的写法把判断符号写上
	var condition = {
		"_logic":"or",
		"id":1,
		"cash":["<",10]
	};
	db("cars").where(condition).select()
	
## .data( ) 方法
	db("cars").data(键值对).insert();
	db("cars").data(键值对).update();
	参数就是普通键值对没做特殊处理，在insert和update操作中有效，select语句中你写了也不报错，只是没效果罢了

## 以上方法，支持链式操作，可以随意组合

## 各种例子
```
			//建表
			db("cars").createTable({
					"id": "integer primary key",
					"date": "date",
					"chepai": "varchar(30)",
					"dest": "varchar(255)",
					"cash": "money"
				});
			
			//插数据
			for(var i=0;i<10;i++){
				var add = {
					"chepai" : "12345",
					"dest" : "深圳",
					"cash" : i
				};
				db("cars").data(add).insert();
			}
			
			//查数据
			db("cars").where({"id":1}).select(function(tx,datas){
				//datas
			});
			
			//修改数据
			db("cars").data({"cash":100,"dest":"广州"}).where({"id":8}).update();
			db("cars").data({"cash":1000}).where({ "id":[">",5], "dest":"深圳" }).update();
			
			//删数据
			//db("cars").where({"id":1}).delete();
```