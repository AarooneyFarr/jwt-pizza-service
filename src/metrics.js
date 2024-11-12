const config = require('./config.js')
const os = require('os')

class Metrics {
	constructor() {
		this.totalRequests = 0
		this.getRequests = 0
		this.postRequests = 0
		this.deleteRequests = 0
		this.putRequests = 0

		this.activeUsers = 0
		this.authAttemptsSuccess = 0
		this.authAttemptsFail = 0

		this.pizzasSold = 0
		this.revenue = 0
		this.purchaseFailure = 0

		this.requestLatency = 0
		this.pizzaLatency = 0

		// This will periodically sent metrics to Grafana
		const timer = this.sendMetricsPeriodically(10000)
		timer.unref()
	}

	sendMetricsPeriodically(period) {
		const timer = setInterval(() => {
			try {
				const buf = new MetricBuilder()

				buf.addHttpMetric('all', this.totalRequests)
				buf.addHttpMetric('get', this.getRequests)
				buf.addHttpMetric('put', this.putRequests)
				buf.addHttpMetric('post', this.postRequests)
				buf.addHttpMetric('delete', this.deleteRequests)
				buf.addHttpMetric('latency', this.requestLatency)

				buf.addSystemMetric('cpu', this.getCpuUsagePercentage())
				buf.addSystemMetric('memory', this.getMemoryUsagePercentage())

				buf.addUserMetric('active-users', this.activeUsers)

				buf.addPurchaseMetric('sold', this.pizzasSold)
				buf.addPurchaseMetric('creation-failures', this.purchaseFailure)
				buf.addPurchaseMetric('revenue', this.revenue)
				buf.addPurchaseMetric('pizza-latency', this.pizzaLatency)

				buf.addAuthMetric('auth-success', this.authAttemptsSuccess)
				buf.addAuthMetric('auth-fail', this.authAttemptsFail)

				const metrics = buf.toString()
				this.sendMetricToGrafana(metrics)
			} catch (error) {
				console.log('Error sending metrics', error)
			}
		}, period)

		return timer
	}

	getCpuUsagePercentage() {
		const cpuUsage = os.loadavg()[0] / os.cpus().length
		return cpuUsage.toFixed(2) * 100
	}

	getMemoryUsagePercentage() {
		const totalMemory = os.totalmem()
		const freeMemory = os.freemem()
		const usedMemory = totalMemory - freeMemory
		const memoryUsage = (usedMemory / totalMemory) * 100
		return memoryUsage.toFixed(2)
	}

	incrementTotalRequests() {
		this.totalRequests++
	}

	incrementPostRequests() {
		this.incrementTotalRequests()
		this.postRequests++
	}

	incrementPutRequests() {
		this.incrementTotalRequests()
		this.putRequests++
	}

	incrementGetRequests() {
		this.incrementTotalRequests()
		this.getRequests++
	}

	incrementDeleteRequests() {
		this.incrementTotalRequests()
		this.deleteRequests++
	}

	incrementAuthFails() {
		this.authAttemptsFail++
	}
	incrementAuthSuccesses() {
		this.authAttemptSuccesses++
	}

	incrementActiveUsers() {
		this.activeUsers++
	}
	decrementActiveUsers() {
		this.activeUsers--
	}

	incrementPizzasSold() {
		this.pizzasSold++
	}

	incrementRevenue(amount) {
		this.revenue += amount
	}

	incrementPurchaseFailure() {
		this.purchaseFailure++
	}

	parseOrder(order) {
		for (const item of order.items) {
			this.incrementPizzasSold()
			this.incrementRevenue(item.price)
		}
	}

	setLatency(val) {
		this.requestLatency = val
	}
	setPizzaLatency(val) {
		this.pizzaLatency = val
	}

	sendMetricToGrafana(metric) {
		fetch(`${config.metrics.url}`, {
			method: 'post',
			body: metric,
			headers: { Authorization: `Bearer ${config.metrics.userId}:${config.metrics.apiKey}` },
		})
			.then((response) => {
				if (!response.ok) {
					console.error('Failed to push metrics data to Grafana')
				} else {
					console.log(`Pushed ${metric}`)
				}
			})
			.catch((error) => {
				console.error('Error pushing metrics:', error)
			})
	}

	requestTracker(req, res, next) {
		switch (req.method) {
			case 'GET':
				this.incrementGetRequests()
				break
			case 'POST':
				this.incrementPostRequests()
				break
			case 'DELETE':
				this.incrementDeleteRequests()
				break
			case 'PUT':
				this.incrementPutRequests()
				break

			default:
				break
		}

		next()
	}
}

class MetricBuilder {
	metricString = ''

	addMetric(metricPrefix, httpMethod, metricName, metricValue) {
		this.metricString += `${metricPrefix},source=${config.metrics.source},method=${httpMethod} ${metricName}=${metricValue} \n`
	}

	addHttpMetric(method, value) {
		this.addMetric('request', method, 'total', value)
	}
	addAuthMetric(method, value) {
		this.addMetric('auth', method, 'total', value)
	}
	addUserMetric(method, value) {
		this.addMetric('user', method, 'total', value)
	}
	addSystemMetric(method, value) {
		this.addMetric('system', method, 'total', value)
	}
	addPurchaseMetric(method, value) {
		this.addMetric('purchase', method, 'total', value)
	}

	toString() {
		return this.metricString
	}
}

const metrics = new Metrics()
module.exports = metrics
