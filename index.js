const colours = ['green', 'blue', 'yellow', 'red', 'raw']

const users = ['jakub', 'sampsa', 'antti']

const initialState = {}
initialState.selectedUser = users[0]
initialState.stats = localStorage.getItem('stats') || {
  jakub: {
    green: 1,
    blue: 2,
    yellow: 3,
    red: 4,
    raw: 5
  }
}

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

const Stat = React.createClass({
  render: function() {
    return <div className={ 'stat ' + this.props.colour }>{this.props.number}</div>
  }
})

const User = React.createClass({
  render: function() {
    const nameClasses = 'name ' + (this.props.selected ? 'selected' : '')
    const stats = this.props.stats || {}
    const total = R.sum(R.values(stats))
    const toStatElement = c => {
      return stats[c] !== undefined
      ? <Stat key={c} colour={c} number={stats[c]}/>
      : undefined
    }
    const statElements = R.map(toStatElement, colours)
    const statElementsWithTotal = total !== 0
      ? R.append((<Stat key='total' colour='total' number={total}/>), statElements)
      : statElements
    return (
      <div className='user'>
        <div className={nameClasses}>{'big ' + this.props.user}</div>
        <div className='stats'>
          { statElementsWithTotal }
        </div>
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
    const toUserElement = user => (
      <User
        key={user}
        user={user}
        selected={user === this.state.selectedUser}
        stats={this.state.stats[user]}
      />
    )
    return (
      <section className="content">
        <section className="users">
          { R.map(toUserElement, this.props.users) }
        </section>
        <section className="buttons">
          { R.map(c => <Button key={c} colour={c} onClick={pushButtonClick} />, colours) }
        </section>
      </section>
    )
  }
})

ReactDOM.render(<Lihamuki users={users}/>, document.getElementById('content'))
