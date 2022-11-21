
//會員
fetch("/MemberLoginCheck").then(r => r.json()).then(
    res => {
        console.log(res);
        if (res === 1) {      //這裡放要去的頁面
            location.href = "/";
        } else if (res === 0) {
            alert("請先登入");
            location.href = "/Member/Member_Login.html";
        }
    })

//店家
fetch("/StoreLoginCheck").then(r => r.json()).then(
    res => {
        console.log(res);
        if (res === 1) {     //這裡放要去的頁面
            location.href = "/";
        } else if (res === 0) {
            alert("請先登入");
            location.href = "/Store/Store_Login.html";
        }
    })

//管理者
fetch("/AdminLoginCheck").then(r => r.json()).then(
    res => {    
        console.log(res);
        if (res === 1) {     //這裡放要去的頁面
            location.href = "/";
        } else if (res === 0) {
            alert("請先登入");
            location.href = "/Store/Store_Login.html";
        }
    })