import React, {Component} from 'react'
import request from 'superagent'
import {Redirect} from 'react-router-dom'
import styles from './styles'

// Login page //
export default class SNSLogin extends Component {
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
                <h1>ログイン</h1>
                <div style={styles.login}>
                    [ユーザID]<br />
                    <input value={this.state.userid} onChange={e => changed('userid', e)} /><br />
                    [パスワード]<br />
                    <input type='password' value={this.state.passwd} onChange={e => changed('passwd', e)} /><br />
                    <button onClick={e => this.api('login')}>ログイン</button><br />
                    <p style={styles.error}>{this.state.msg}</p>
                    ※ 初めての方はユーザ登録を行ってください<br />
                    <p><a href={'/signin'}>→ユーザ登録</a></p>
                </div>
            </div>
        )
    }
}
