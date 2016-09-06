const users = ['jakub', 'sampsa', 'antti']
const colours = ['green', 'blue', 'yellow', 'red', 'raw']
const defaultValues = R.fromPairs(R.map(c => [c, 0], colours))

const initialState = {}
initialState.selectedUser = users[0]
initialState.stats = localStorage.getItem('stats') || {}

const event$ = Bacon.Bus()
const userClick$ = event$.filter(e => e.type === 'userClick')
const buttonClick$ = event$.filter(e => e.type === 'buttonClick')

const state$ = Bacon.update(initialState,
  userClick$, (state, c) => R.assoc('selectedUser', c.value, state),
  buttonClick$, (unpatchedState, c) => {
    const user = unpatchedState.selectedUser
    const colour = c.value
    const state = unpatchedState.stats[user] === undefined
      ? R.assocPath(['stats', user], defaultValues, unpatchedState)
      : unpatchedState
    return R.over(R.lensPath(['stats', user, colour]), R.inc, state)
  }
)

state$.map('.stats').skipDuplicates().onValue(s => localStorage.setItem('stats', s))

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
      return (stats[c] === undefined || stats[c] === 0)
      ? undefined
      : <Stat key={c} colour={c} number={stats[c]}/>
    }
    const statElements = R.map(toStatElement, colours)
    const statElementsWithTotal = total !== 0
      ? R.append((<Stat key='total' colour='total' number={total}/>), statElements)
      : statElements
    return (
      <div className='user' onClick={() => this.props.onClick(this.props.user)}>
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
    const userClick = user => event$.push({ type: 'userClick', value: user })
    const toUserElement = user => (
      <User
        key={user}
        user={user}
        selected={user === this.state.selectedUser}
        stats={this.state.stats[user]}
        onClick={userClick}
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
