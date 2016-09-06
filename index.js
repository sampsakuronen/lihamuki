const users = ['jakub', 'sampsa', 'antti']

const initialState = localStorage.getItem('stats') || {}
initialState.selectedUser = users[0]

const event$ = Bacon.Bus()

event$.log('event')

const state$ = Bacon.update(initialState,
  event$, (state, e) => state
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
    const nameClasses = 'name ' + (this.props.selected ? 'selected' : '')
    return (
      <div className='user'>
        <div className={nameClasses}>{this.props.user}</div>
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
      <section className="content">
        <section className="users">
          { R.map(user => <User key={user} user={user} selected={user === this.state.selectedUser}/>, this.props.users) }
        </section>
        <section className="buttons">
          <Button colour='green' onClick={pushButtonClick} />
          <Button colour='blue' onClick={pushButtonClick} />
          <Button colour='yellow' onClick={pushButtonClick} />
          <Button colour='red' onClick={pushButtonClick} />
          <Button colour='raw' onClick={pushButtonClick} />
        </section>
      </section>
    )
  }
})

ReactDOM.render(<Lihamuki users={users}/>, document.getElementById('content'))
