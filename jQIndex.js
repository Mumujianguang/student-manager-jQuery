var cacheData = [];

function bindEvent() {
    // 切换选项事件
    $('.menu_list').on('click', 'dd', function () {
        changeMenu(this);
    });
    // 编辑/删除按钮事件
    $('#tBody').on('click', 'button', function () {
        if ( $(this).hasClass('editBtn') ) {
            $('.dialog').show();
            backFill( $(this).attr('data-id') );
        }
        if ( $(this).hasClass('removeBtn') ) {
            removeStuInfo( $(this).attr('data-sNo') );
        }
    });
    // 点击遮罩层隐藏编辑区
    $('.mask').on('click', function () {
        $('.dialog').hide();
    })
    // 更新学生信息
    $('.changeBtn').on('click', function (e) {
        e.preventDefault();
        updateStuInfo();
    });
    // 添加学生信息
    $('#add_student_btn').on('click', function (e) {
        e.preventDefault();
        addStuInfo();
    });
}
// 回填表单
function backFill(index) {
    var curData = cacheData[index];
    var $form = $('#changeStudentInfo');
    for (var prop in curData) {
        if ( $form[0][prop] ) {
            $form[0][prop].value = curData[prop];
        }
    }
}
// 新增学生信息
function addStuInfo() {
    var data = getForm( $('#add_student_form').serializeArray() );
    transferData('http://api.duyiedu.com/api/student/addStudent', data, function () {
        var isTurnPage = confirm('添加成功, 是否跳转到学生列表?');
        $('#add_student_form')[0].reset();
        renderData();
        if (isTurnPage) {
            changeMenu('#menuStudentList');
        }
    });
}
// 删除学生信息
function removeStuInfo(sNo) {
    transferData('http://api.duyiedu.com/api/student/delBySno', sNo, function () {
        alert('删除成功!');
        renderData();
    });
}
// 更新学生信息
function updateStuInfo() {
    var data = getForm( $('#changeStudentInfo').serializeArray() );
    transferData('http://api.duyiedu.com/api/student/updateStudent', data, function () {
        alert('修改成功！');
        $('.dialog').hide();
        renderData();
    });
}
// 格式化表单数据
function getForm(data) {
    var obj = {};
    data.forEach(function (ele, index) {
        obj[ele.name] = ele.value;
    })
    return obj;
}
// 切换选项
function changeMenu(self) {
    $('.active').removeClass('active');
    $(self).addClass('active');
    $('.content_active').removeClass('content_active');
    if ($(self).data('id') == 'stuList') {
        $('.stuList').addClass('content_active');
    } else if ($(self).data('id') == 'addStu') {
        $('.addStu').addClass('content_active');
    }
}
// 渲染数据
function renderData() {
    $('#tBody').empty();
    transferData('http://api.duyiedu.com/api/student/findAll', "", function (data) {
        var str = "";
        cacheData = data;
        console.log(cacheData);
        cacheData.forEach(function (ele, index) {
            str += "<tr>\
                <td>" + ele.sNo + "</td>\
                <td>" + ele.name + "</td>\
                <td>" + (ele.sex == 0 ? '男' : '女') + "</td>\
                <td>" + ele.email + "</td>\
                <td>" + (new Date().getFullYear() - ele.birth) + "</td>\
                <td>" + ele.phone + "</td>\
                <td>" + ele.address + "</td>\
                <td>\
                    <button class='btn editBtn' data-id='" + index + "'>编辑</button>\
                    <button class='btn removeBtn' data-sNo='" + ele.sNo + "'>删除</button>\
                </td>\
            </tr>"
        });
        $('#tBody').html(str);
    });
}

// 发送请求
function transferData(url, data, callback) {
    $.ajax({
        type: 'GET',
        url: url,
        data: $.extend(data, {
            sNo: data || {},
            appkey: '1419479392_1553871312917'
        }),
        dataType : 'json',
        success: function (res) {
            if (res.status == 'success') {
                typeof callback == 'function' && callback(res.data);
            } else {
                alert( res.msg );
            }
        },
        error : function (e) {
            console.log(e);
        }
    })
}

bindEvent();
renderData();