
function model(table){
	var that = this;
	this._table = table;
	
	this.db = openDatabase("kudb", "1.0", "websql数据库", 1024 * 1024 * 100);
	this._datas = {};
	this._where = [];
	this._order = '';
	this._limit = '';
	this._group = '';
	this._field = '*';
	this._lastsql = '';
	
	this.data = function(datas){
		this._datas = datas;
		return this;
	};
	
	this.where = function(where){
		this._where = where;
		return this;
	};
	
	this.order = function(order){
		this._order = order;
		return this;
	};
	
	this.group = function(group){
		this._group = group;
		return this;
	};
	
	this.field = function(field){
		this._field = field;
		return this;
	};
	
	this.table = function(table){
		init();
		this._table = table;
		return this;
	};
	//建表删表
	this.createTable = function(cols){
		var sql = "create table if not exists "+ this._table;
		var colstr = "";
		var col_arr = [];
		if(cols){
			for(col in cols){
				col_arr.push(col+" "+cols[col]);
			}
			colstr = col_arr.join(",");
			sql += "("+ colstr +")"
		}
		this.query(sql);
	}
	this.dropTable = function(){
		this.query("drop table "+this._table);
	}
	//各种增删改查
	this.select = function(callback){
		var sqlobj = this.parseSql("select");
		this.query(sqlobj.sql, sqlobj.param, callback);
		return this;
	};
	
	this.delete = function(callback){
		var sqlobj = this.parseSql("delete");
		this.query(sqlobj.sql, sqlobj.param, callback);
		return this;
	};
	
	this.update = function(callback){
		var sqlobj = this.parseSql("update");
		this.query(sqlobj.sql, sqlobj.param, callback);
		return this;
	};
	
	this.insert = function(callback){
		var sqlobj = this.parseSql("insert");
		this.query(sqlobj.sql, sqlobj.param, callback);
		return this;
	};
	
	//生成sql语句
	this.parseSql=function(queryType){
		var ret = {
			"sql" : "",
			"param" : []
		};
		//组装主体
		if(queryType=='select'){
			ret.sql = "select " + this._field + " from "+this._table;
		}else if(queryType=='update'){
			ret.sql = "update " + this._table;
			var update_obj = this.parseUpdate(this._datas);
			ret.sql += " set "+ update_obj.sql;
			ret.param = ret.param.concat(update_obj.vals);
		}else if(queryType=='delete'){
			ret.sql = "delete from " + this._table;
		}else if(queryType=='insert'){
			var insert_obj = this.parseInsert(this._datas);
			ret.sql = "insert into " + this._table + "("+ insert_obj.colsql +") values("+ insert_obj.valsql +")";
			ret.param = ret.param.concat(insert_obj.vals);
			return ret;
		}
		//组装where
		if(this._where){
			var where_obj = this.parseWhere(this._where);
			ret.sql += " where "+ where_obj.sql;
			ret.param = ret.param.concat(where_obj.vals);
		}
		//组装order
		if(this._order.length>0){
			ret.sql += " order by " + this._order;
		}
		//组装group by
		if(this._group.length>0){
			ret.sql += " group by " + this._group;
		}
		//组装limit
		if(this._limit.length>0){
			ret.sql += " limit " + this._limit;
		}
		
		return ret;
	};
	
	
	//根据where数据生成where语句
	this.parseWhere = function(where){
		var where_str = '';
		var logic = 'and';
		var where_val = [];
		if(typeof(where)=='string'){
			where_str = where;
		}else{
			if(where._logic){
				logic = where._logic;
				delete where._logic;
			}
			var where_key_arr = [];
			for(var key in where){
				var val = where[key];
				var operate = "=";
				console.log(key);
				console.log(val);
				
				if(!isNaN(key)){//数字下标
					var subret = this.parseWhere(val); //递归分析子条件
					where_key_arr.push(subret.sql);
					where_val.concat(subret.vals);
				}else if(Array.isArray(val) && val.length==2){//数组类型，带操作符
					operate = val[0];
					where_key_arr.push(key + operate + "?");
					where_val.push(val[1]);
				}else{//键值对
					where_key_arr.push(key + operate + "?");
					where_val.push(val);
				}
			}
			where_str = where_key_arr.length>0 ? "("+ where_key_arr.join(' '+ logic +' ') +")" : '';
			console.log(where_str);
		}
		return {
			"sql":where_str,
			"vals":where_val
		};
	};
	
	
	//根据data数据生成update语句中的字段
	this.parseUpdate = function(datas){
		var update_str = '';
		var update_val = [];
		var update_key_arr = [];
		for(var key in datas){
			update_key_arr.push(key+"=?");
			update_val.push(datas[key]);
		}
		update_str = update_key_arr.length>0 ? update_key_arr.join(',') : '';
		
		return {
			"sql":update_str,
			"vals":update_val
		};
	};
	
	//根据data数据生成insert语句中的字段
	this.parseInsert = function(datas){
		var insert_str = '';
		var insert_val = [];
		var insert_key_arr = [];
		var insert_kv_arr = [];
		for(var key in datas){
			insert_key_arr.push(key);
			insert_kv_arr.push("?");
			insert_val.push(datas[key]);
		}
		insert_str = insert_key_arr.length>0 ? insert_key_arr.join(',') : '';
		insert_kvstr = insert_kv_arr.length>0 ? insert_kv_arr.join(',') : '';
		
		return {
			"colsql":insert_str,
			"valsql":insert_kvstr,
			"vals":insert_val
		};
	};
	
	this.query = function(sql,param,callback){
		this._lastsql = sql;
		this.db.transaction(function(tx) {
			tx.executeSql(sql, param, callback);
		});
	};
	this.getLastSql = function(){
		return this._lastsql;
	}
	
	return this;
}
function db(table){
	return new model(table);
}
