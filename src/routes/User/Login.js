import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { instanceOf } from 'prop-types';
import { routerRedux } from 'dva/router';
import { Checkbox, Alert, Icon, Divider, Modal, Form, Input, Button, message, Switch } from 'antd';
import Login from 'components/Login';
import styles from './Login.less';
import { hex_md5 } from '../../md5';
import { ipcRenderer } from 'electron';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import TokenLogin from './TokenLogin';
const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;
const FormItem = Form.Item;
let isMobile;
enquireScreen(b => {
  isMobile = b;
});
@Form.create()
@connect(({ login, loading, user }) => ({
  login,
  user,
  submitting: false,
  // submitting: loading.effects['login/login'],
}))
export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mainClass: styles.main,
      type: 'account',
      autoLogin: true,
      login_way: '700003',
      isMobile: isMobile,
      load:false,
      url: window.configUrls.serve.substring(7),
      setUp: false,
      enable: false,
      isMob:
        navigator.userAgent.match(/(iPad).*OS\s([\d_]+)/) ||
        navigator.userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ||
        navigator.userAgent.match(/(Android)\s+([\d.]+)/),
    };
  }
  componentWillMount() {
    sessionStorage.clear();
    message.config({
      top: 100,
    });
    this.setState({
      proxyInfo:localStorage.getItem('proxyInfo') ? JSON.parse(localStorage.getItem('proxyInfo')) : null,
    })
  }
  componentDidMount() {
    ipcRenderer.on('proxy-info', this.proxyInfo);
    this.enquireHandler = enquireScreen(mobile => {
      this.setState({
        isMobile: mobile,
      });
    });
    this.props.dispatch({
      type: 'user/findTool',
      payload: {
        value: '',
      },
    });
    this.getConfig();
  }
  proxyInfo = (event, data) => {
    console.log('proxyInfo=======>',data);
    localStorage.setItem('proxyInfo', JSON.stringify(data));
    this.setState({
      proxyInfo:data,
    })
  };
  getConfig = () => {
    this.props.dispatch({
      type: 'user/getConfigGoto',
      callback: response => {
        if (response.system) {
          if (response.system.use_proxy) {
            window.configUrl = {
              sysName: 'Smartlinkey', //项目名称
              ywzxUrl: `${window.configUrls.serve}/ywzx`, //运维中心
              testUrl: `${window.configUrls.serve}/aqzx`, //安全中心登陆接口
              rybjxx: `${window.configUrls.serve}/cid${response.system.huaci.huaci_list[1].cid}`, //人员背景核查系统
              personList: ['姓名', '公民身份号码', '性别', '民族'], //人员背景核查信息
              socket_server: `${window.configUrls.serve}`,
              slkMessage: `${window.configUrls.serve}/slk-message`,
            };
          } else {
            window.configUrl = {
              sysName: 'Smartlinkey', //项目名称
              ywzxUrl: response.system.ywzx, //运维中心
              testUrl: response.system.login_server, //安全中心登陆接口
              rybjxx: response.system.huaci.huaci_list[1].api, //人员背景核查系统
              personList: ['姓名', '公民身份号码', '性别', '民族'], //人员背景核查信息
              socket_server: response.system.socket_server,
              slkMessage: response.system.socket_server,
            };
          }
        }
        this.props.dispatch({
          type: 'login/getLoginSetting',
          payload: {},
          callback: response => {
            if (response && response.result) {
              this.setState({
                login_way: response.result.login_way,
              });
            }
          },
        });
      },
    });
  };
  onTabChange = type => {
    this.setState({ type });
  };
  componentWillUnmount() {
    ipcRenderer.removeListener('proxy-info', this.proxyInfo);
    unenquireScreen(this.enquireHandler);
  }
  handleSubmit = (err, values) => {
    const { type } = this.state;
    if (!err) {
      this.props.dispatch({
        type: 'login/login',
        payload: {
          // ...values,
          username: values.username,
          password: hex_md5(values.password),
          sid: 'Smartlinkey_sys',
          // type,
        },
        callback: response => {
          this.setState({
            mainClass: styles.zoomOut,
            load:true,
          })
          response.data.password = hex_md5(values.password);
          let userJson = JSON.stringify(response.data);
          sessionStorage.setItem('user', userJson);
          setTimeout(()=>{
            this.props.dispatch(routerRedux.push('/smartList/smartAll?type=0'));
            ipcRenderer.send('login-success');
            this.setState({
              load:false,
            })
          },500);
        },
      });
      this.props.dispatch({
        type: 'login/getLogin',
      });
    }
  };

  renderMessage = content => {
    return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
  };
  CloseWindow = () => {
    window.close();
  };
  setUpShow = () => {
    this.props.form.resetFields(['setupIp']);
    this.props.form.setFieldsValue({
      proxyIp: this.state.proxyInfo['user_setting'],
    })
    this.setState({
      setUp: true,
      enable:this.state.proxyInfo['enable'],
    });
  };
  handleCancel = () => {
    this.setState({
      setUp: false,
    });
  };
  handleOks = () => {
    this.props.form.validateFields((err, values) => {
      let reg = /^(?:(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:1[0-9][0-9]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:2[0-4][0-9])|(?:25[0-5])|(?:1[0-9][0-9])|(?:[1-9][0-9])|(?:[0-9]))$/;
      let regs = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\:([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/;
      if (values.setupIp && (reg.test(values.setupIp) || regs.test(values.setupIp))) {
        localStorage.setItem('ip', 'http://' + values.setupIp);
        window.configUrls.serve = 'http://' + values.setupIp;
        this.setState({
          url: values.setupIp,
        });
        let proxyInfo = {
          "enable": this.state.enable,
          "user_setting": values.proxyIp,
          "ie_proxy": this.state.proxyInfo.ie_proxy,
        }
        ipcRenderer.send('proxy-info',proxyInfo);
        localStorage.setItem('proxyInfo', JSON.stringify(proxyInfo));
        this.getConfig();
        message.success('操作成功');
        this.setState({
          setUp: false,
          success: true,
          proxyInfo:proxyInfo
        });
      }
    });
  };
  getIp = (rule, value, callback) => {
    let reg = /^(?:(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:1[0-9][0-9]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:2[0-4][0-9])|(?:25[0-5])|(?:1[0-9][0-9])|(?:[1-9][0-9])|(?:[0-9]))$/;
    let regs = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\:([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/;
    if (value && !reg.test(value) && !regs.test(value)) {
      callback('请输入合理的IP地址', '');
      return;
    }
    callback();
    return;
  };
  changeProxy = () =>{
    if(this.state.proxyInfo.ie_proxy.ProxyServer.length > 0){
      this.props.form.setFieldsValue({
        proxyIp: this.state.proxyInfo.ie_proxy.ProxyServer,
      })
    }else{
      message.warn('暂无代理地址，请手动配置');
    }
  }
  changeEnable = (checked) =>{
    this.setState({
      enable:checked,
    })
  }
  render() {
    const { login, submitting } = this.props;
    const { type } = this.state;
    const { getFieldDecorator } = this.props.form;
    let PKI =
      this.state.login_way === '700001' ? (
        ''
      ) : (
        <Tab
          key="PKI"
          tab={
            <div className={this.state.isMobile && this.state.isMob ? styles.none : ''}>
              PKI登录
            </div>
          }
        >
          <img style={{ width: '80%', margin: '20px 10% 0' }} src="images/pki.png" alt="" />
          <div
            style={{ fontSize: '20px', marginTop: '24px', textAlign: 'center' }}
            className={styles.fontColor}
          >
            请插入PKI
          </div>
        </Tab>
      );
    const formItemLayout = {
      labelCol: {
        xs: { span: 8 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 16 },
      },
    };
    return (
      <div className={this.state.mainClass} id={'box'}>
        <TokenLogin />
        <Icon className={styles.szBtn} type="setting" theme="outlined" onClick={this.setUpShow} />
        <Modal
          title="设置"
          visible={this.state.setUp}
          maskClosable={false}
          onCancel={this.handleCancel}
          className={styles.modalBox}
          getContainer={() => document.getElementById('box')}
          footer={
            <Button type="primary" onClick={this.handleOks}>
              确定
            </Button>
          }
        >
          <Form>
            <FormItem {...formItemLayout} label="服务地址">
              {getFieldDecorator('setupIp', {
                initialValue: this.state.url,
                rules: [
                  {
                    validator: this.getIp,
                  },
                  {
                    required: true,
                    message: '请输入服务器地址',
                  },
                ],
              })(<Input type="text" placeholder="请输入服务器地址" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="启用代理">
              {getFieldDecorator('enable')(
                <div>
                  <Switch checkedChildren="是" unCheckedChildren="否" checked={this.state.enable} onChange={this.changeEnable}/>
                  <a className={this.state.enable ? '' : styles.none} style={{marginLeft: '48px'}} onClick={this.changeProxy}>获取IE代理</a>
                </div>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="代理地址" className={this.state.enable ? '' : styles.none}>
              {getFieldDecorator('proxyIp', {
                rules: [
                  {
                    validator: this.getIp,
                  },
                ],
              })(<Input type="text" placeholder="请输入代理地址" />)}
            </FormItem>
          </Form>
        </Modal>
        <div
          className={this.state.isMobile && this.state.isMob ? styles.none : styles.loginHeader}
        >
          <div className={styles.dragHeader}>
            <span style={{ float: 'left' }}>Smartlinkey</span>
            <span style={{ float: 'right' }}>
            <Icon type="close" className={styles.iconWindows} onClick={this.CloseWindow} />
          </span>
          </div>
        </div>
        <img
          src="images/logo.png"
          className={styles.logoLogin}
          style={{ marginTop: this.state.isMobile && this.state.isMob ? '50px' : '15px' }}
        />
        <img src="images/smartlinkey.png" className={styles.smartIcon} />
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          className={styles.loginAllStyle}
        >
          <Tab
            key="account"
            tab={
              <div
                style={this.state.login_way === '700001' ? {} : { borderRight: '2px solid #ff3366', paddingRight: '26px' }}
                className={this.state.isMobile && this.state.isMob ? styles.none : ''}
              >
                帐号密码登录
              </div>
            }
            style={{ marginRight: '0!important' }}
            className={this.state.login_way === '700002' ? styles.none : ''}
          >
            {login.status === 'error' &&
            login.type === 'account' &&
            !submitting &&
            this.renderMessage('帐号或密码错误')}
            <UserName name="username" placeholder="请输入用户名" />
            <Password name="password" placeholder="请输入密码" />
            <Submit loading={submitting||this.state.load} className={styles.btnBg}>
              {this.state.load ? '登录中…' : '登录'}
            </Submit>
          </Tab>
          {PKI}
        </Login>
      </div>
    );
  }
}
