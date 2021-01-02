/**
 * 有道单词本插件
 */
var CryptoJS = require("crypto-js");
var LOGIN_URL = "https://logindict.youdao.com/login/acc/login";
var ADD_WORD_URL = "http://dict.youdao.com/wordbook/ajax";

function buildResult(res) {
    var result = {
        "from": "en",
        "to": "zh-Hans",
        "fromParagraphs": [
            "success add to word book"
        ],
        "toParagraphs": [res]
    }
    return result;
}

function supportLanguages() {
    return ['auto', 'zh-Hans', 'en'];
}

function translate(query, completion) {
    var login_cookie;
    var text = query.text;
    var fromLanguage = query.detectFrom;
    var login_option = $option.login_option;

    if (fromLanguage != 'en') {
        completion({'result': buildResult("中文无需添加单词本")});
        return;
    }

    if (login_option == 2) {
        $log.info('获取的用户名、密码：【' + $option.account + '】、【' + $option.password + '】');
        login($option.account, CryptoJS.MD5($option.password));
    } else if (login_option == 1) {
        login_cookie = $option.login_cookie;
    }

    if (login_cookie) {
        $log.info('cookie:' + login_cookie);
        addWord(login_cookie, text);
    } else {
        completion({
            'error': {
                'type': 'param',
                'message': '缺失 cookie',
                'addtion': '无'
            }
        });
    }
    // 成功
    completion({'result': buildResult("添加单词本成功")});
}

var login_header = {
    'Host': 'logindict.youdao.com',
    'Connection': 'keep-alive',
    'Content-Length': 225,
    'Cache-Control': 'max-age=0',
    'Upgrade-Insecure-Requests': 1,
    'Origin': 'http://account.youdao.com',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document',
    'Referer': 'http://account.youdao.com/',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9'
}

function login(username, password_md5) {
    $http.post({
        url: LOGIN_URL,
        header: login_header,
        body: {
            app: 'web',
            tp: 'urstoken',
            cf: 3,
            fr: 1,
            ru: 'http://dict.youdao.com/wordbook/wordlist?keyfrom=dict2.index#/',
            product: 'DICT',
            type: 1,
            um: true,
            username: username,
            password: password_md5,
            agreePrRule: 1
        },
        handler: function (resp) {
            var data = resp.data
            $log.info('以下是接口返回值-------------');
            $log.info(resp.data);
            $log.info(resp.response);
        }
    });
}

function addWord(cookie, word) {
    $http.get({
        url: ADD_WORD_URL,
        header: {
            'Host': 'dict.youdao.com',
            'Referer': 'http://dict.youdao.com/wordbook/wordlist?keyfrom=dict2.index',
            'Upgrade-Insecure-Requests': 1,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Cookie': cookie
        },
        body: {
            'action': 'addword',
            'le': 'eng',
            'q': word
        },
        handler: function (resp) {
            var data = resp.data
            $log.info('接口返回值: ' + JSON.stringify(data));
        }
    });
}

