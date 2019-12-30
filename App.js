import React, {Component} from 'react';
import {
  View,
  TouchableHighlight,
  TimePickerAndroid,
  StyleSheet,
} from 'react-native';

import {
  Container,
  Header,
  Title,
  Button,
  Content,
  Text,
  Footer,
  FooterTab,
  Right,
  Body,
  H1,
  H2,
  H3,
  Card,
  CardItem,
} from 'native-base';

import {calculateScheduledBedTime} from './src/libs/bedTime.js';

class App extends Component {
  state = {
    date: new Date(),
    hours: 0,
    minutes: 0,
    period: '',
    mode: '',
    sleepCycles: [],
    showRestart: false,
  };

  componentDidMount() {
    const hours = this.state.date.getHours();
    const minutes = this.state.date.getMinutes();
    this.setTime(hours, minutes);
  }

  getCurrentTime = () => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    return {
      hours,
      minutes: currentTime.getMinutes(),
      period: hours >= 12 ? 'PM' : 'AM',
    };
  };

  setTime = (hours, minutes) => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const date = this.state.date;
    date.setHours(hours);
    date.setMinutes(minutes);
    hours = hours > 12 ? hours - 12 : hours;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    this.setState({
      hours,
      minutes,
      period,
      date,
    });
  };

  open = async () => {
    try {
      const {action, hour, minute} = await TimePickerAndroid.open({
        hour: this.state.date.getHours(),
        minute: this.state.date.getMinutes(),
        is24Hour: false,
      });
      console.log({action, hour, minute});
      if (action !== TimePickerAndroid.dismissedAction) {
        this.setTime(hour, minute);
      }
    } catch ({code, message}) {
      console.warn('Cannot open time picker', message);
    }
  };

  renderCycles = () => {
    const {sleepCycles} = this.state;

    return sleepCycles.length > 0 ? (
      <View style={style.cyclesContainer}>
        {sleepCycles.map((cycle, index) => {
          return (
            <Text style={style.cycleItem} key={index}>
              {index !== 0 && <Text>or</Text>}{' '}
              <Text style={style.cycle}>{cycle}</Text>
            </Text>
          );
        })}
      </View>
    ) : null;
  };

  calculateWakeUp = () => {
    const {hours, minutes, period} = this.state;
    this.setState({
      sleepCycles: calculateScheduledBedTime(hours, minutes, period, 'wakeUp'),
      mode: 'wakeUp',
      showRestart: true,
    });
  };

  calculateSleepNow = () => {
    const {hours, minutes, period} = this.getCurrentTime();

    this.setState({
      mode: 'sleepNow',
      showRestart: true,
      sleepCycles: calculateScheduledBedTime(
        hours,
        minutes,
        period,
        'sleepNow',
      ),
    });
  };

  reset = () => {
    this.setState({
      showRestart: false,
      sleepCycles: [],
      mode: '',
    });
  };

  render() {
    const {hours, minutes, period, mode, showRestart} = this.state;

    return (
      <Container>
        <Header>
          <Body>
            <Title> Sleepy</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          <Card>
            <CardItem>
              <Body>
                <H1 style={style.header}>To what time you want to wake up?</H1>
                <View style={style.sleepNowWrapper}>
                  <View style={style.sleepNowcontainer}>
                    <TouchableHighlight onPress={this.open}>
                      <View style={style.timeItem}>
                        <Text style={style.itemText}>Hours</Text>
                        <Text style={style.itemText}>{hours}</Text>
                      </View>
                    </TouchableHighlight>

                    <TouchableHighlight onPress={this.open}>
                      <View style={style.timeItem}>
                        <Text style={style.itemText}>Minutes</Text>
                        <Text style={style.itemText}>{minutes}</Text>
                      </View>
                    </TouchableHighlight>

                    <TouchableHighlight onPress={this.open}>
                      <View style={style.timeItem}>
                        <Text style={style.itemText}>Period</Text>
                        <Text style={style.itemText}>{period}</Text>
                      </View>
                    </TouchableHighlight>
                  </View>
                  {mode === 'wakeUp' && (
                    <View style={style.cyclesWrapper}>
                      <Text>
                        You should try to fall asleep at one of the following
                        times:
                      </Text>
                      {this.renderCycles()}
                    </View>
                  )}
                </View>
              </Body>
            </CardItem>
            {!showRestart && (
              <CardItem style={style.actionContainer} footer bordered>
                <Button onPress={this.calculateWakeUp}>
                  <Text>Calculate</Text>
                </Button>
              </CardItem>
            )}
          </Card>
          <View style={{alignSelf: 'center'}}>
            <Text>Or</Text>
          </View>
          <Card>
            <CardItem>
              <Body>
                <H1 style={style.header}>
                  Find out when to get up if you go to bed now
                </H1>
                <View style={style.sleepNowWrapper}>
                  {mode === 'sleepNow' && (
                    <View style={style.cyclesWrapper}>
                      <Text>
                        If you head to bed right now, you should try to wake up
                        at one of the following times:
                      </Text>
                      {this.renderCycles()}
                    </View>
                  )}
                </View>
              </Body>
            </CardItem>
            {!showRestart && (
              <CardItem style={style.actionContainer} footer bordered>
                <Button onPress={this.calculateSleepNow}>
                  <Text>ZZZ</Text>
                </Button>
              </CardItem>
            )}
          </Card>
        </Content>
        {showRestart && (
          <Footer>
            <FooterTab>
              <Button full onPress={this.reset}>
                <H2 style={{color: 'white'}}>Back</H2>
              </Button>
            </FooterTab>
          </Footer>
        )}
      </Container>
    );
  }
}

const style = StyleSheet.create({
  textCenter: {
    textAlign: 'center',
  },
  header: {
    textAlign: 'center',
    fontSize: 20,
    marginTop: 25,
    marginBottom: 15,
    fontWeight: '700',
  },
  sleepNowWrapper: {
    display: 'flex',
    alignItems: 'center',
  },

  sleepNowcontainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
    marginBottom: 20,
  },

  timeItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemText: {
    fontSize: 18,
  },

  cyclesWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cyclesContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  cycleItem: {
    display: 'flex',
    marginLeft: 5,
  },

  cycle: {
    color: '#6be177',
    fontWeight: '700',
  },

  actionContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
