'use strict';
let token;

$('.signin').show();
$(toggleClasses);

$('.js-signin').on('click', signIn());
$('#main').on('click', '#new-account', signup());
$('.js-create-account').on('click', createAccount());

function signIn() {
	return function() {
		const user = {
			username: $('.uname').val(),
			password: $('.pwd').val()
		};
		console.log(user);
		sendUserLoginDetails(user, openHomePage);
	};
}

function sendUserLoginDetails(user, callback) {
	const userDetails = {
		url: '/api/auth/login',
		type: 'POST',
		data: JSON.stringify(user),
		cache: false,
		headers: {
			'Content-Type': 'application/json'
		},
		success: callback,
		error: loginFailure
	};
	$.ajax(userDetails);
}

function openHomePage(data) {
	token = data.jwtToken;
	console.log(token);
	localStorage.setItem('jwtToken', token);
	token = '';
	localStorage.setItem('username', data.user.username);
	$('.signin').hide();
	hideEntryPage();
	fetchExpenseData(loadExpenseData);
}

function hideEntryPage() {
	$('.signin').hide();
	$('#tabs').hide();
	$('.nav').show();
	$('.home').show();
	$('.expenses').show();
}

function loginFailure() {
	return function(err) {
		if (err.status === 401) {
			$('.error').html('Username and/or password incorrect');
		}
	};
}

function fetchExpenseData(callback) {
	token = localStorage.getItem('jwtToken');
	const userDetails = {
		url: '/api/expenses',
		type: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		success: callback,
		error: loginFailure
	};
	$.ajax(userDetails);
}

function loadExpenseData(data) {
	$('.home').show();
	let expenses = createExpenseTable(data);
	$('.expenseDetails').html(expenses);
}

function createExpenseTable(expenseData) {
	console.log(expenseData);
	const expenses = expenseData.map(expense => {
		return `<tr data=${expense.id}>
              <td>${expense.date}</td>
              <td>${expense.expenseInfo}</td>
              <td>${expense.category}</td>
              <td>${expense.amount}</td>
			  <td><button class="edit-btn js-edit"><i class="fa fa-edit" aria-hidden="true"></i>Edit</button></td> 
              <td><button class ="delete-btn js-delete"><i class ="fa fa-trash-o" aria-hidden ="true"></i>Delete</button></td>
      </tr>`;
	});
	let expenseHeader = `<tr>
           <th>Date</th> 
           <th>Expense Info</th> 
           <th>Category</th> 
		   <th>Amount</th> 
		   <th>Edit</th>
		   <th>Delete</th>
         </tr>`;
	let expenseTable = `<table class="expenseTable">${expenseHeader}${expenses.join(
		''
	)}</table>`;
	return expenseTable;
}

function addExpenseData() {
	return function() {
		console.log('Add expense data');
		const expenseInfo = {
			date: $('.date').val(),
			expenseInfo: $('.info').val(),
			category: $('#category option:selected').text(),
			amount: $('.amount').val()
		};
		saveExpenseData(expenseInfo, refreshExpenseGrid);
	};
}

function saveExpenseData(expenseInfo, callback) {
	const expenseDetails = {
		url: '/api/expenses',
		type: 'POST',
		data: JSON.stringify(expenseInfo),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		success: callback,
		error: loginFailure
	};
	$.ajax(expenseDetails);
}

function refreshExpenseGrid(data) {
	console.log('load expense data');
	const latestExpense = `<tr data=${data.id}>
              <td>${data.date}</td>
              <td>${data.expenseInfo}</td>
              <td>${data.category}</td>
              <td>${data.amount}</td>
			  <td><button class="edit-btn js-edit"><i class="fa fa-edit" aria-hidden="true"></i>Edit</button></td> 
              <td><button class ="delete-btn js-delete"><i class ="fa fa-trash-o" aria-hidden ="true"></i>Delete</button></td>
      </tr>`;
	$('.expenseTable').append(latestExpense);
}

function signup() {
	return function(event) {
		$('.signup').show();
		console.log('Clicked signup link');
		localStorage.removeItem('jwtToken');
		token = '';
		console.log(localStorage.getItem('jwtToken'), token);
		$('.signin').hide();
		$('.home').hide();
	};
}

function createAccount() {
	return function(event) {
		console.log('clicked signup button');
		let user = {
			name: $('.name').val(),
			email: $('.email').val(),
			username: $('.username').val(),
			password: $('.password').val()
		};

		sendAccountCreationDetails(user);
	};
}

function sendAccountCreationDetails(user) {
	console.log(user);
	let accountCreationInfo = {
		url: '/api/users',
		type: 'POST',
		data: JSON.stringify({
			name: user.name,
			email: user.email,
			username: user.username,
			password: user.password
		}),
		headers: {
			'Content-Type': 'application/json'
		},
		success: function() {
			alert('User created successfully');
			console.log('User created successfully');
			$('.signin').show();
			$('.signup').hide();
			$('.home').hide();
			$('.expenses').hide();
		},
		error: loginFailure
	};
	$.ajax(accountCreationInfo);
}

$('.homeTab').click(function() {
	console.log('hime tab clicked');
	$('.home').show();
	$('#tabs').hide();
});

$('.signout').click(function() {
	localStorage.removeItem('jwtToken');
	$('.signin').show();
	$('.home').hide();
	$('.expenses').hide();
	$('.nav').hide();
	$('#tabs').hide();
});

function isAuthenticated(cb) {
	$.ajax({
		url: '/isAuthenticated',
		method: 'GET',
		headers: {
			Authorization: 'Bearer ' + localStorage.getItem('jwt_token')
		},
		success: cb,
		error: cb
	});
}

function handleView() {
	$('.expenses').show();
	fetchExpenseData(loadExpenseData);
}

/*isAuthenticated(response => {
	if (response === 'OK') {
		$('.signin').toggle();
		console.log(`You are authenticated!`);
		handleView();
		$('.nav').show();
	} else {
		console.log(`You are not authenticated!`);
		$('.signin').show();
	}
});  */

$(function() {
	$('#datepicker').datepicker({
		dateFormat: 'dd-M-yy',
		changeYear: true,
		changeMonth: true
	});
	$('#datepicker').datepicker('setDate', new Date());
});

$(function() {
	$('#datepicker1').datepicker({
		dateFormat: 'dd-M-yy',
		changeYear: true,
		changeMonth: true
	});
});

function updateExpense() {
	var updatedExpense = {
		date: $('.udate').val(),
		expenseInfo: $('.uinfo').val(),
		category: $('#ucategory option:selected').text(),
		amount: $('.uamount').val()
	};
	const expenseId = localStorage.getItem('expenseId');
	$('#' + expenseId + ' > td:eq(0)').text(updatedExpense.date);
	let request = {
		url: `/api/expenses/${expenseId}`,
		type: 'PUT',
		data: JSON.stringify(updatedExpense),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		success: saveUpdatedExpense,
		error: function(err) {
			console.log(err);
		}
	};
	$.ajax(request);
}

function saveUpdatedExpense(data) {
	window.alert('Saved successfully');
}

function onFormSubmit(formContext, date, expenseInfo, category, amount, id) {
	formContext.find('form').on('submit', function(event) {
		event.preventDefault();

		const expenseInfoValue = formContext.find('form input[name=info]').val();
		const dateValue = formContext.find('form input[name=date]').val();
		const categoryValue = $('#ucategory option:selected').text();
		const amountValue = formContext.find('form input[name=amount]').val();

		date.text(dateValue);
		expenseInfo.text(expenseInfoValue);
		category.text(categoryValue);
		amount.text(amountValue);

		formContext.dialog('close');
	});
}

function edit() {
	const editButton = $(this);
	$('#dialog-form').dialog({
		open: function dialogOpened() {
			const formContext = $(this);

			const tr = editButton.closest('tr');

			const id = tr.attr('data');

			const date = tr.find('td:nth-child(1)');
			const expenseInfo = tr.find('td:nth-child(2)');
			const category = tr.find('td:nth-child(3)');
			const amount = tr.find('td:nth-child(4)');

			const dateValue = date.text();
			const expenseInfoValue = expenseInfo.text();
			const categoryValue = category.text();
			const amountValue = amount.text();
			formContext.find('form input[name=info]').val(expenseInfoValue);
			formContext.find('form input[name=date]').val(dateValue);
			$('#ucategory option:contains(' + categoryValue + ')').attr(
				'selected',
				true
			);
			formContext.find('form input[name=amount]').val(amountValue);

			onFormSubmit(formContext, date, expenseInfo, category, amount, id);
		},
		close: function() {
			$('#dialog-form form').off();
		}
	});
}

$('#main').on('click', '.js-edit', edit);

$('.js-expense').on('click', addExpenseData());
$('.graph').on('click', function() {
	toggleClasses();
	$('#tabs').tabs();
	$('#tabs').show();
	$('.nav').show();
});

function toggleClasses() {
	$('.signup').hide();
	$('.nav').hide();
	$('.home').hide();
	$('#tabs').hide();
}

$('#month').change(function() {
	$('.card').hide();
	$('.graphData').empty();
	let month = $('#month option:selected').text();
	let year = new Date().getFullYear();
	let query = {
		month: month,
		year: year
	};
	if (month !== 'Please select') getMonthlyExpenses(query, generateGraphReport);
});

function getMonthlyExpenses(query, callback) {
	const request = {
		url: '/api/expenses/monthly',
		method: 'POST',
		data: JSON.stringify(query),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		success: callback,
		error: function(err) {
			console.error(err);
		}
	};
	$.ajax(request);
}

function generateGraphReport(data) {
	let totalAmount = 0;
	if (data.length > 0) {
		if (data.length === 1) {
			totalAmount = data[0].amount;
			console.log('amount', totalAmount);
		} else {
			totalAmount = data.reduce((total, sum) => total.amount + sum.amount);
			console.log('amount', totalAmount);
		}
		$('.card').show();
		$('.monthlyTotal').html(`$${totalAmount}`);
		let graphData = prepareCategoryExpensePair(data);
		prepareGraph(graphData, '.graphData');
	}
}

function prepareCategoryExpensePair(data) {
	if (data.length > 0) {
		let totalCategoryExpenses = data.reduce((obj, item) => {
			let category = item.category;
			let amount = item.amount;
			if (typeof obj[category] !== 'number') {
				obj[category] = amount; // initialize value that wasn't found yet
			} else {
				obj[category] += amount; // update the value with the current increment
			}
			return obj;
		}, {});
		console.log(totalCategoryExpenses);
		var graphData = [];
		for (var key in totalCategoryExpenses) {
			console.log(key);
			var items = {
				Name: key,
				Value: totalCategoryExpenses[key]
			};
			graphData.push(items);
		}
		return graphData;
	}
}

function prepareGraph(graphData, graphClass) {
	var width = 460;
	var height = 360;
	var radius = Math.min(width, height) / 2;
	var color = d3.scale.category10();
	var svg = d3
		.select(graphClass)
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		.append('g')
		.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
	var arc = d3.svg
		.arc()
		.outerRadius(radius - 10)
		.innerRadius(radius - 80);
	var div = d3
		.select('body')
		.append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0);
	var pie = d3.layout
		.pie()
		.value(function(d, i) {
			console.log(d);
			return d.Value;
		})
		.sort(null);
	var path = svg
		.selectAll('path')
		.data(pie(graphData))
		.enter()
		.append('path')
		.attr('d', arc)
		.on('mouseover', function(d) {
			div
				.transition()
				.duration(0)
				.style('opacity', 0.9);
			div
				.html('Category: <br>' + d.data.Name + '<br/>Amount: ' + d.data.Value)
				.style('left', d3.event.pageX + 'px')
				.style('top', d3.event.pageY - 28 + 'px');
		})
		.on('mouseout', function(d) {
			div
				.transition()
				.duration(0)
				.style('opacity', 0);
		})
		.attr('fill', function(d, i) {
			return color(d.data.Name);
		});
}

function getDailyExpense() {
	console.log('daily');
	const request = {
		url: '/api/expenses/daily',
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		success: generateDailyGraphReport,
		error: function(err) {
			console.error(err);
		}
	};
	$.ajax(request);
}

function generateDailyGraphReport(data) {
	let graphData = prepareCategoryExpensePair(data);
	console.log(graphData);
	prepareGraph(graphData, '.dailyGraphData');
}

$('#tabs').tabs({
	activate: function(event, ui) {
		console.log('inside activate', ui.newTab.index());

		if (ui.newTab.index() == 2) {
			console.log('stats');
			getTotalExpenses();
			getBarGraph();
		} else if (ui.newTab.index() == 1) {
			console.log('daily');
			getDailyExpense();
		}
	}
});

function getTotalExpenses() {
	const request = {
		url: '/api/expenses/totalExpenses',
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		success: generateTotalExpenseReport,
		error: function(err) {
			console.log(err);
		}
	};
	$.ajax(request);
}

function generateTotalExpenseReport(data) {
	console.log(data);
	let graphData = prepareCategoryExpensePair(data);
	prepareGraph(graphData, '.totalExpenseGraph');
}

function getBarGraph() {
	const request = {
		url: '/api/expenses/groupExpense',
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		success: createBarGraph,
		error: function(err) {
			console.log(err);
		}
	};
	$.ajax(request);
}

function createBarGraph(data) {
	console.log('bar', data);
	var svgWidth = 600;
	var svgHeight = 300;

	var heightPad = 50;
	var widthPad = 50;
	$('.barGraph').empty();
	var svg = d3
		.select('.barGraph')
		.append('svg')
		.attr('width', svgWidth + widthPad * 2)
		.attr('height', svgHeight + heightPad * 2)
		.append('g')
		.attr('transform', 'translate(' + widthPad + ',' + heightPad + ')');

	//Set up scales
	var xScale = d3.scale
		.ordinal()
		.domain(
			data.map(function(d) {
				return d._id;
			})
		)
		.rangeRoundBands([0, svgWidth], 0.1);

	var yScale = d3.scale
		.linear()
		.domain([
			0,
			d3.max(data, function(d) {
				return d.Total;
			})
		])
		.range([svgHeight, 0]);

	// Create bars
	svg
		.selectAll('rect')
		.data(data)
		.enter()
		.append('rect')
		.attr('x', function(d) {
			return xScale(d._id) + widthPad;
		})
		.attr('y', function(d) {
			return yScale(d.Total);
		})
		.attr('height', function(d) {
			return svgHeight - yScale(d.Total);
		})
		.attr('width', xScale.rangeBand())
		.attr('fill', 'blue');

	// Y axis
	var yAxis = d3.svg
		.axis()
		.scale(yScale)
		.orient('left');

	svg
		.append('g')
		.attr('class', 'axis')
		.attr('transform', 'translate(' + widthPad + ',0)')
		.call(yAxis)
		.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('y', -50)
		.style('text-anchor', 'end')
		.text('Total Expense');

	// X axis
	var xAxis = d3.svg
		.axis()
		.scale(xScale)
		.orient('bottom');

	svg
		.append('g')
		.attr('class', 'axis')
		.attr('transform', 'translate(' + widthPad + ',' + svgHeight + ')')
		.call(xAxis)
		.append('text')
		.attr('x', svgWidth / 2 - widthPad)
		.attr('y', 50)
		.text('Monthly expenses for current year');
}

$('#main').on('click', '.js-delete', function() {
	let confirm = window.confirm('Are you sure you want to delete?');
	if (confirm == true) {
		let expenseId = $(this)
			.closest('tr')
			.attr('data');
		console.log(expenseId);
		$(this)
			.closest('tr')
			.remove();
		deleteExpense(expenseId);
	} else console.log('Cancel');
});

function deleteExpense(expenseId) {
	let request = {
		url: `/api/expenses/${expenseId}`,
		type: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		error: function(err) {
			console.log(JSON.stringify(err));
		}
	};
	$.ajax(request);
}

function onSuccessFullDeletion() {
	console.log('deleted successfully');
}
