// 编辑表单
var dialog = document.getElementsByClassName('dialog')[0];
// 存储获取到的学生信息
var data = null;
// 页码
var page = 0;
// 数据总数
var allInfoNum;
// 总页数
var totalPage;

function init() {
    bindEvent();
}

function bindEvent() {
    // 切换列表选项
    var menuList = document.getElementsByClassName('menu_list')[0];
    menuList.addEventListener('click', changeMenu, false);
    // 新增学生
    var addStudentBtn = document.getElementById('add_student_btn');
    addStudentBtn.addEventListener('click', function (e) {
        // addStudent();
        updateStudent(e, 'http://api.duyiedu.com/api/student/addStudent', 'add_student_form');
    }, false);
    // 修改学生信息
    var changeBtn = document.getElementsByClassName('changeBtn')[0];
    changeBtn.addEventListener('click', function (e) {
        // changeStudentInfo();
        updateStudent(e, 'http://api.duyiedu.com/api/student/updateStudent', 'changeStudentInfo');
    }, false);
    // 点击遮罩层隐藏表单
    var mask = document.getElementsByClassName('mask')[0];
    mask.onclick = function () {
        hideForm();
    }
    // 上一页
    var prevPageBtn = document.getElementById('prevPageBtn');
    prevPageBtn.addEventListener('click', function (e) {
        changePage(e);

    }, false);
    // 下一页
    var nextPageBtn = document.getElementById('nextPageBtn');
    nextPageBtn.addEventListener('click', function (e) {
        changePage(e);

    }, false);
}

// 换页
function changePage(e) {
    var btnType = e.target.id;
    if (btnType == 'prevPageBtn' && page != 0) {
        page--;
        renderTable();
    } else if (btnType == 'nextPageBtn' && page != (totalPage - 1)) {
        page++;
        renderTable();
    }
}

// 操作学生列表信息-增，改
function updateStudent(e, url, formName) {
    e.preventDefault();
    var form = document.getElementById(formName);
    var data = getFormData(form);
    console.log(data);
    if (!data) {
        return false;
    }

    transferData(url, data, function (res) {
        if (res.status == 'success') {
            if (formName == 'add_student_form') {
                var isTurnPage = confirm('添加成功, 是否跳转到学生列表?');
                if (isTurnPage) {
                    var menuStudentList = document.getElementById('menuStudentList');
                    menuStudentList.click();
                }
                form.reset();
            } else if (formName == 'changeStudentInfo') {
                alert('修改信息成功!');
                hideForm();
                renderTable();
            }
        } else {
            alert(res.msg);
        }
    })

}

// function addStudent(e) {
//     e.preventDefault();
//     var form = document.getElementById('add_student_form');
//     var data = getFormData(form);
//     if (!data) {
//         return false;
//     }
//     transferData('http://api.duyiedu.com/api/student/addStudent', data, function () {
//         var isTurnPage = confirm('添加成功, 是否跳转到学生列表?');
//         if (isTurnPage) {
//             var menuStudentList = document.getElementById('menuStudentList');
//             menuStudentList.click();
//         }
//         form.reset();
//     })
// }

// function changeStudentInfo(e) {
//     e.preventDefault();
//     var form = document.getElementById('changeStudentInfo');
//     var data = getFormData(form);
//     transferData('http://api.duyiedu.com/api/student/updateStudent', data, function (res) {
//         if (res.status == 'success') {
//             alert('修改信息成功!');
//             hideForm();
//             renderTable();
//         } else {
//             alert(res.msg);
//         }
//     });
// }

// 显示编辑表单
function displayForm(obj) {
    dialog.style.display = 'block';
    backFill(obj);
}
// 隐藏编辑表单
function hideForm() {
    dialog.style.display = 'none';
}

// 回填表单
function backFill(obj) {
    var form = document.getElementById('changeStudentInfo');
    var index = parseInt(obj.getAttribute('data-id'));
    var stuObj = data[index];
    for (var prop in stuObj) {
        if (form[prop]) {
            form[prop].value = stuObj[prop];
        }
    }
}
// 删除学生信息
function removeStudent(obj) {
    var sNo = obj.getAttribute('data-sno');
    transferData('http://api.duyiedu.com/api/student/delBySno', {
        sNo: sNo
    }, function (res) {
        if (res.status == 'success') {
            renderTable();
            alert('删除成功');
        } else {
            alert(res.msg);
        }
    });
}

// 封装提交的数据
function getFormData(dom) {
    var name = dom.name.value;
    var sex = dom.sex.value;
    var sNo = dom.sNo.value;
    var email = dom.email.value;
    var birth = dom.birth.value;
    var phone = dom.phone.value;
    var address = dom.address.value;

    if (!name || !sex || !sNo || !email || !birth || !phone || !address) {
        alert('请填写完整的信息');
        return false;
    }else if ( /[\D]+/g.test(sNo) ) {
        alert('学号只能为纯数字');
        return false;
    }else if ( !/\d{6,}[@]\w+[.](com)$/g.test(email) ) {
        alert('请输入正确的邮箱');
        return false;
    }else if ( !/^\d{4}$/g.test(birth) ) {
        alert('请输入正确的年份');
        return false;
    }else if ( !/^\d{11}$/g.test(phone) ) {
        alert('请输入正确位数的手机号');
        return false;
    }else if ( !/^[\u4E00-\u9FA5]+$/g.test(address) ) {
        alert('地区只能填写中文');
        return false;
    }

    return {
        name: name,
        sex: sex,
        sNo: sNo,
        email: email,
        birth: birth,
        phone: phone,
        address: address
    }
}
// 切换菜单选项
function changeMenu(e) {
    var target = e.target.tagName;
    if (target == 'DD') {
        page = 0;
        initMenuCss(e.target);
        var id = e.target.getAttribute('data-id');
        var content = document.getElementsByClassName(id)[0];
        initMenuContent(content);

        if (id == 'stuList') {
            renderTable();
        }
    }
}
// 渲染数据
function renderTable() {
    transferData('http://api.duyiedu.com/api/student/findAll', "", function (res) {
        data = res.data;
        var str = "";
        allInfoNum = data.length;
        totalPage = Math.ceil(allInfoNum / 10);

        if (allInfoNum > 10) {
            var len = (allInfoNum - page * 10) > 10 ? 10 : allInfoNum - page * 10;
        } else {
            var len = allInfoNum;
        }
        var index = 0;
        for (; index < len; index++) {
            var ele = data[index + page * 10];
            str += '<tr>\
            <td> ' + ele.sNo + ' </td>\
            <td> ' + ele.name + ' </td>\
            <td> ' + (ele.sex == 0 ? '男' : '女') + ' </td>\
            <td> ' + ele.email + ' </td>\
            <td> ' + (new Date().getFullYear() - ele.birth) + ' </td>\
            <td> ' + ele.phone + ' </td>\
            <td> ' + ele.address + ' </td>\
            <td>\
                <button class="btn editBtn" onclick="displayForm(this)" data-id=" ' + (index + page * 10) + ' ">编辑</button>\
                <button class="btn removeBtn" onclick="removeStudent(this)" data-sno="' + ele.sNo + '">删除</button>\
            </td>\
            </tr>'
        }
        var tBody = document.getElementById('tBody');
        tBody.innerHTML = str;
    })

}
// 发送请求，回调接收响应
function transferData(url, data, callback) {
    data = data || {};
    var result = saveData(url, Object.assign(data, {
        appkey: '1419479392_1553871312917'
    }));
    if (result.status == 'success') {
        callback(result);
    } else {
        alert(result.msg);
    }
}

function initMenuCss(target) {
    var active = document.getElementsByClassName('active');
    for (var i = 0; i < active.length; i++) {
        active[i].classList.remove('active');
    }
    target.classList.add('active');
}

function initMenuContent(target) {
    var active = document.getElementsByClassName('content_active');
    for (var i = 0; i < active.length; i++) {
        active[i].classList.remove('content_active');
    }
    target.classList.add('content_active');
}

// 向后端发送数据
function saveData(url, param) {
    var result = null;
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    if (typeof param == 'string') {
        xhr.open('GET', url + '?' + param, false);
    } else if (typeof param == 'object') {
        var str = "";
        for (var prop in param) {
            str += prop + '=' + param[prop] + '&';
        }
        xhr.open('GET', url + '?' + str, false);
    } else {
        xhr.open('GET', url + '?' + param.toString(), false);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                result = JSON.parse(xhr.responseText);
            }
        }
    }
    xhr.send();
    return result;
}

init();
renderTable();