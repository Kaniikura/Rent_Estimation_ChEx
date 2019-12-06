function getElementByXpath(path) {
	return document.evaluate(path, document, null, XPathResult.STRING_TYPE, null);
  }
  
$(function () {
		let dicts = {"面積":0,"築年数":0,"階":0,"総階数":0,"最寄り1":0,"最寄り2":0,
			"最寄り3":0,"エレベーター":0,"防犯カメラ":0,"洗面化粧台":0,"光ファイバー":0,
			"初期費用カード決済可":0,"保証人不要":0,"バイク置場":0,"ペット相談":0,"即入居可":0,
			"デザイナーズ":0,"フロントサービス":0,"眺望良好":0,"タワー型マンション":0,
			"マンション":0,"アパート":0,"一戸建て":0,"テラス・タウンハウス":0,"その他":0,
			"間取りサイズ":0,"S":0,"L":0,"D":0,"K":0,"世田谷区":0,	"中央区":0,
			"中野区":0,"北区":0,"千代田区":0,"台東区":0,"品川区":0,"墨田区":0,"大田区":0,
			"文京区":0,"新宿区":0,"杉並区":0,"板橋区":0,"江戸川区":0,"江東区":0,"渋谷区":0,
			"港区":0,"目黒区":0,"練馬区":0,"荒川区":0,"葛飾区":0,"豊島区":0,"足立区":0};
		let Weights = [ 0.38474134, -0.06327944,  0.09945097,  0.07673502, -0.04043414,
			-0.02683616, -0.06230853, -0.02962453,  0.20751766, -0.66633802,
			-0.09166102, -0.24157225, -0.1683076 ,  0.05865953,  0.6220759 ,
			 0.39365997,  0.15146438,  3.61278715, -0.02642473,  0.66106841,
			 1.23699427,  1.67616233, -1.77633214, -1.48193545,  0.        ,
			-1.97816818, -0.99702606, -0.5529199 , -1.43354519, -0.52590328,
			 0.1550374 ,  0.82049615, -0.        , -0.3817913 ,  2.1145226 ,
			-0.20649827,  0.52711125, -0.60193425, -0.42303221,  0.36371608,
			 0.98710464, -0.        , -1.37033515, -1.62602233, -0.35143482,
			 3.68685614,  4.85894005,  1.85826718, -1.56772286, -1.07121212,
			-1.87472122,  0.        , -2.10661818];
		let bias = 2.1319622070697353;
		
		let main_text = $("#js-view_gallery > div.l-property_view_table\
															 > table").text();
		main_text = main_text.replace(/(\t)+|(\r)+| |-|<[^>]+>$/g,"");
		main_text=main_text.replace(/(\t)+|(\r)+| |-$/g,"");
        main_text=main_text.replace(/(\s|\t)+$/g,"\n");
		main_text_list=main_text.split("\n");
		main_source = main_text_list.filter(function (el) {
			return el != "";
		  });
		
		let floors = getElementByXpath('/html/.//*[@id=\"contents\"]\
			/div[@class=\"section l-space_small\"]/table/tbody/tr[2]/td[1]');
	    floors = floors.stringValue.match(/(\d)+階建/)[0];
	
		let features = $("#bkdt-option > div > ul > li").text();
		features_list = features.split("\u3001");
		
		 //区名
		address = main_source[1];
		if(address.match(/都(.)+区/) == null){
			$(".property_view_note-emphasis").append(
			"<div class='num'> <font size= \"2\">"+"error: 23区ではありません"+ "</font></div>");
		}else{
			prefecture = address.match(/都(.)+区/)[0].slice(1);
			dicts[prefecture] = 1;

			//アクセス
			for (var i = 3; i < 6; i++){
				if(main_source[i].includes("分")){
					minute = Number(main_source[i].match(/(\d)+分/)[0].slice(0,-1));
					dicts["最寄り"+(i-2)] = minute;
				}else { 
					dicts["最寄り"+(i-2)] = 20;
				}
			}

			if(main_source.slice(-3,-2)[0] == "向き"){
				diff = 1;
			}else{
				diff = 0;
			}
			//面積
			area = main_source.slice(-9+diff,-8+diff)[0].replace("m2","");
			dicts["面積"]=Number(area);

			//築年数
			if (main_source.slice(-7+diff,-6+diff)[0]=="新築"){
				dicts["築年数"]=0;
			}else{
				age = main_source.slice(-7+diff,-6+diff)[0].match(/(\d)+/g);
				dicts["築年数"]=Number(age);
			}

			//階
			floor = main_source.slice(-5+diff,-4+diff)[0].match(/(\d)+/g);
			dicts["階"]=Number(floor);

			//総階数
			dicts["総階数"]=Number(floors.match(/(\d)+/g));
			//間取り
			if(main_source.slice(-11+diff,-10+diff)[0]=="ワンルーム"){
				fp = "1";
			}
			else{
				fp = main_source.slice(-11+diff,-10+diff)[0];
			}
			fp_size = fp.match(/(\d)+/g)[0];
			dicts["間取りサイズ"] = Number(fp_size);
			fp_types = fp.replace(/(\d)+/g,"")
			for (var i = 0; i < fp_types.length; i++) {
				dicts[fp_types.slice(i,i+1)[0]]=1;
			}

			//建物種別
			building_type = main_source.slice(-1)[0];
			dicts[building_type] = 1;

			//特徴
			for (key in dicts) {
				if (features.includes(key)){
					//"S","L","D,"K"は除く
					if(key.length !== 1){
						dicts[key] = 1;
					}
				}
			}
			
			//score
			i=0;
			let score = 0;
			for (key in dicts){
				score += Weights[i] * dicts[key];
				i++;
			}
			score += bias;
			//小数点一桁目まで
			score = Math.round(score * 10) / 10;
			console.log("得られた情報");
			console.log(dicts);
			let dicts_weight = {};
			Object.assign(dicts_weight , dicts);
			i=0;
			for (key in dicts){
				dicts_weight[key] = Weights[i];
				i++;
			}
			console.log("各属性の重み");
			console.log(dicts_weight);
			$(".property_view_note-emphasis").append(
				"<div class='num'> <font size= \"2\">"+" 推定値:" + score +"万円"+ "</font></div>"
			);
		}
});