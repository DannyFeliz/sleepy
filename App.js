import React, {Component} from 'react';
import {
  View,
  TouchableHighlight,
  Text,
  TimePickerAndroid,
  StyleSheet,
  Button,
} from 'react-native';

import {calculateScheduledBedTime} from './src/libs/bedTime.js';

class App extends Component {
  state = {
    date: new Date(),
    hours: 0,
    minutes: 0,
    period: '',
    mode: '',
    sleepCycles: [],
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
      <>
        <Text style={style.cyclesHeader}>
          You should try to fall asleep at one of the following times:
        </Text>
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
      </>
    ) : null;
  };

  calculateWakeUp = () => {
    const {hours, minutes, period} = this.state;
    this.setState({
      sleepCycles: calculateScheduledBedTime(hours, minutes, period, 'wakeUp'),
    });
  };

  calculateSleepNow = () => {
    const {hours, minutes, period} = this.getCurrentTime();

    this.setState({
      sleepCycles: calculateScheduledBedTime(
        hours,
        minutes,
        period,
        'sleepNow',
      ),
    });
  };

  render() {
    const {hours, minutes, period} = this.state;

    return (
      <View>
        <Text style={style.header}>To what time you want to wake up?</Text>
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
          <Button title="Calculate" onPress={this.calculateWakeUp} />
          <View style={style.cyclesWrapper}>{this.renderCycles()}</View>
        </View>
        <View>
          <Text style={style.textCenter}>Or</Text>
          <View>
            <Button title="ZZZ" onPress={this.calculateSleepNow} />
          </View>
        </View>
      </View>
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

  cyclesHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 25,
    marginBottom: 10,
    textAlign: 'center',
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
  },
  cycleItem: {
    display: 'flex',
    marginLeft: 5,
  },

  cycle: {
    color: '#6be177',
    fontWeight: '700',
  },
});

export default App;
