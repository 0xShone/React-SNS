import React, {Component} from 'react'
import request from 'superagent'
import {Redirect} from 'react-router-dom'
import styles from './styles'

// Signin page //
export default class SNSSignin extends Component {
    constructor (props) {
        super(props)
        this.state = { userid: '', passwd: '', jump: '', msg: '' }
    }
    // Call API -> Get Token -> Save at localStorage
    api (command) {
        request
            .get('/api/' + command)
            .query({
                userid: this.state.userid,
                passwd: this.state.passwd
            })
            .end((err, res) => {
                if (err) return
                const r = res.body
                console.log(r)
                if (r.status && r.token) {
                    // Save Token to localStorage
                    window.localStorage['sns_id']         = this.state.userid
                    window.localStorage['sns_auth_token'] = r.token
                    this.setState({jump: '/timeline'})
                    return
                }
                this.setState({msg: r.msg})
            })
    }
    render () {
        if (this.state.jump) {
            return <Redirect to={this.state.jump} />
        }
        const changed = (name, e) => this.setState({[name]: e.target.value})
        return (
            <div>
                <h1>新規ユーザ登録</h1>
                <div style={styles.login}>
                    ※ 初めての方はユーザIDとパスワードを入力して下記のボタンを押してください<br />
                    [ユーザID]<br />
                    <input value={this.state.userid} onChange={e => changed('userid', e)} /><br />
                    [パスワード]<br />
                    <input type='password' value={this.state.passwd} onChange={e => changed('passwd', e)} /><br />
                    <p style={styles.error}>{this.state.msg}</p>
                    <p><button onClick={e => this.api('adduser')}>ユーザ登録</button></p>
                    ※ 既にアカウントをお持ちの方はログインへ<br />
                    <p><a href={'/login'}>→ログイン</a></p>
                </div>
            </div>
        )
    }
}
