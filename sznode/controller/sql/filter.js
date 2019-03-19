const filterNum = {}
function commonTypes(arr) {  
    var result = new Array();  
    var obj = {};  
    for (var i = 0; i < arr.length; i++) {  
        for (var j = 0; j < arr[i].length; j++) {  
            var str = arr[i][j];  
            if (!obj[str]) {  
                obj[str] = 1;  
            }  
            else {  
                obj[str]++;  
                if (obj[str] == arr.length)  
                {  
                    result.push(str);  
                }  
            }
        }
    }
    return result;  
}

filterNum.commonTypes = commonTypes

module.exports = filterNum