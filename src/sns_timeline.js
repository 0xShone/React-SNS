import React, {Component} from 'react'
import request from 'superagent'
import styles from './styles'

// Timeline Page //
export default class SNSTimeline extends Component {
    constructor (props) {
        super(props)
        this.state = { timelines: [], comment: '' }
    }
    componentWillMount () {
        this.loadTimelines()
    }
    loadTimelines () { // Get timeline comments from local strage
        request
            .get('/api/get_friends_timeline')
            .query({
                userid: window.localStorage.sns_id,
                token: window.localStorage.sns_auth_token
            })
            .end((err, res) => {
                if (err) return
                this.setState({timelines: res.body.timelines})
            })
    }
    post () { // Post comments to timeline
        request
            .get('/api/add_timeline')
            .query({
                userid: window.localStorage.sns_id,
                token: window.localStorage.sns_auth_token,
                comment: this.state.comment
            })
            .end((err, res) => {
                if (err) return
                this.setState({comment: ''})
                this.loadTimelines()
            })
    }
    render () {
        // Generate timeline
        const timelines = this.state.timelines.map(e => {
            return (
                <div key={e._id} style={styles.timeline}>
                    <img src={'user.png'} style={styles.tl_img} />
                    <div style={styles.userid}>{e.userid}:</div>
                    <div style={styles.comment}>{e.comment}</div>
                    <p style={{clear: 'both'}} />
                </div>
            )
        })
        return (
            <div>
                <h1>React-SNS TIME LINE</h1>
                <div>
                    <input value={this.state.comment} size={40}
                        onChange={e => this.setState({comment: e.target.value})} />
                    <button onClick={e => this.post()}>  コメントを投稿</button>
                </div>
                <div>{timelines}</div>
                <hr />
                <p><a href={'/users'}>→タイムラインに表示するユーザをフォロー</a></p>
                <p><a href={'/login'}>→別のユーザでログイン</a></p>
            </div>
        )
    }
}
