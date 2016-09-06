const users = ['jakub', 'sampsa', 'antti']

const initialState = localStorage.getItem('stats') || {}
initialState.currentUser = users[0]

const event$ = Bacon.Bus()

event$.log('event')

const state$ = Bacon.update(initialState,
  event$, (e, state) => state
)

state$.log('state')

const Button = React.createClass({
  render: function() {
    return <div
      className={ 'button ' + this.props.colour }
      onClick={() => this.props.onClick(this.props.colour)}
    />
  }
})

const User = React.createClass({
  render: function() {
    return (
      <div className='user'>
        <div className='name'>{this.props.user}</div>
      </div>
    )
  }
})



const Lihamuki = React.createClass({
  getInitialState: function() {
    return initialState
  },
  componentDidMount: function() {
    state$.onValue(nextState => this.setState(nextState))
  },
  render: function() {
    const pushButtonClick = colour => event$.push({ type: 'buttonClick', value: colour })
    return (
      <section>
        <section className="buttons">
          <Button colour='green' onClick={pushButtonClick} />
          <Button colour='blue' onClick={pushButtonClick} />
          <Button colour='yellow' onClick={pushButtonClick} />
          <Button colour='red' onClick={pushButtonClick} />
          <Button colour='raw' onClick={pushButtonClick} />
        </section>
        <section className="users">
          { R.map(user => <User key={user} user={user}/>, this.props.users) }
        </section>
      </section>
    )
  }
})

ReactDOM.render(
  <Lihamuki users={users}/>,
  document.getElementById('content')
)
