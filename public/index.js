'use strict';

$('.signin').show();
$(toggleClasses);

$('.js-signin').on('click', signIn());
$('#main').on('click', '#new-account', signup());
$('.signup').on('submit', createAccount());

function signIn() {
	return function () {
		$('.error').hide();
		const user = {
			username: $('.uname').val(),
			password: $('.pwd').val()
		};
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
	localStorage.setItem('jwtToken', data.jwtToken);
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
	$('body').css('background-image', 'none');
}

function loginFailure(err) {
	if (err.responseText === "Unauthorized") {
		$('.error').show();
		$('.error').html("Incorrect username or password");
	}
};

function accountCreationFailure(err) {
	if (JSON.parse(err.responseText).error.includes("Database Error: A user with that username and/or email already exists.")) {
		$('.error1').show();
		$('.error1').html("Username already exists.Please try different username");
	}
};
function expenseCreationFailure(err) {
	alert(JSON.parse(err.responseText).error.details[0].message); 
};

function fetchExpenseData(callback) {
	let token = localStorage.getItem('jwtToken');

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
	if (data.length > 0) {
		$('.home').show();
		$('.graph').show();
		let expenses = createExpenseTable(data);
		$('.expenseDetails').html(expenses);
	} else {
		$('.graph').hide();
		$('.expenseDetails').html(`<span class="empty">You haven't added any expenses.Please go ahead and add some</span>`);
	}
}

function createExpenseTable(expenseData) {
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
	let expenseHeader = `<thead><tr>
           <th>Date</th> 
           <th>Expense Info</th> 
           <th>Category</th> 
		   <th>Amount</th> 
		   <th>Edit</th>
		   <th>Delete</th>
         </tr></thead>`;
	let expenseTable = `<table class="expenseTable">${expenseHeader}<tbody>${expenses.join('')}</tbody></table>`;
	return expenseTable;
}

function addExpenseData() {
	return function (event) {
		event.preventDefault();
		const expenseInfo = {
			date: $('.date').val(),
			expenseInfo: $('.info').val(),
			category: $('#category option:selected').text(),
			amount: $('.amount').val()
		};
		console.log(expenseInfo);

		saveExpenseData(expenseInfo, refreshExpenseGrid);
	};
}

function saveExpenseData(expenseInfo, callback) {
	let token = localStorage.getItem('jwtToken');

	const expenseDetails = {
		url: '/api/expenses',
		type: 'POST',
		data: JSON.stringify(expenseInfo),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		success: callback,
		error: expenseCreationFailure
	};
	$.ajax(expenseDetails);
}

function refreshExpenseGrid(data) {
	$('.empty').hide();
	$('.graph').show();
	let expenseTable = createExpenseTable(data);
	$('.expenseDetails').html(expenseTable);


}

function signup() {
	return function () {
		$('.signup').show();
		$('.error1').hide();
		localStorage.removeItem('jwtToken');
		$('.signin').hide();
		$('.home').hide();
	};
}

function createAccount() {
	return function (event) {
		event.preventDefault();
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
		success: function () {
			alert('User created successfully');
			$('.signin').show();
			// $('.signup').hide();
			// $('.home').hide();
			// $('.expenses').hide();
			toggleClasses();
		},
		error: accountCreationFailure
	};
	$.ajax(accountCreationInfo);
}

$('.homeTab').click(function () {
	$('.home').show();
	$('#tabs').hide();
});

$('.signout').click(function () {
	localStorage.removeItem('jwtToken');
	$('body').css('background-image', `url('images/money.jpg')`);
	$('.signin').show();
	toggleClasses();
});

function date() {
	return {
		dateFormat: 'dd-M-yy',
		maxDate: "0d",
		changeMonth: true
	};
}

$(function () {
	$('#datepicker').datepicker(date());
	$('#datepicker').datepicker('setDate', new Date());
});

function updateExpense() {
	let token = localStorage.getItem('jwtToken');

	let updatedExpense = {
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
		error: function (err) {
			console.log(err);
		}
	};
	$.ajax(request);
}

function saveUpdatedExpense(data) {
	alert('Saved successfully');
}

function onFormSubmit(formContext, date, expenseInfo, category, amount, id) {
	formContext.find('form').on('submit', function (event) {
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
				'selected', true);
			formContext.find('form input[name=amount]').val(amountValue);
			onFormSubmit(formContext, date, expenseInfo, category, amount, id);
		},
		close: function () {
			$('#dialog-form form').off();
		}
	});
}

$('#main').on('click', '.js-edit', edit);

$('.expenseForm').on('submit', addExpenseData());

$('.graph').on('click', function () {
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
	$('.error').hide();
	$('.error1').hide();
}

$('#month').change(function () {
	$('.card1').hide();
	$('.graphData').empty();
	let month = $('#month option:selected').text();
	let year = new Date().getFullYear();
	let query = {
		month: month,
		year: year
	};
	if (month !== 'Please select') {
		getMonthlyExpenses(query, generateGraphReport);
	}
});

function getMonthlyExpenses(query, callback) {
	let token = localStorage.getItem('jwtToken');
	const request = {
		url: '/api/expenses/monthly',
		method: 'POST',
		data: JSON.stringify(query),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		success: callback,
		error: function (err) {
			console.log(err);
		}
	};
	$.ajax(request);
}

function generateGraphReport(data) {
	let totalAmount = 0;
	if (data.length > 0) {
		totalAmount = getTotalAmount(data, totalAmount);
		$('.card1').show();
		$('.monthlyTotal').html(`$${totalAmount}`);
		let graphData = prepareCategoryExpensePair(data);
		prepareGraph(graphData, '.graphData');
	} else {
		$('.monthlyInfo').html("No records found for the selected month");
	}
}

$(function () {
	$('#datepicker1').datepicker(date);
});

$(function () {
	$('#datepicker2').datepicker({
		dateFormat: 'dd-M-yy',
		onSelect: function (day) {
			$('.card2').hide();
			getDailyExpense(day)
		}
	});
});

function getTotalAmount(data, totalAmount) {
	if (data.length === 1) {
		totalAmount = data[0].amount;
	} else {
		totalAmount = data.reduce((total, sum) => total.amount + sum.amount);
		totalAmount = data.map(function (obj) {
				return obj.amount;
			})
			.reduce(function (a, b) {
				return a + b;
			});
	}
	return totalAmount;
}

function prepareCategoryExpensePair(data) {
	if (data.length > 0) {
		let totalCategoryExpenses = data.reduce((obj, item) => {
			let category = item.category;
			let amount = item.amount;
			if (typeof obj[category] !== 'number') {
				obj[category] = amount;
			} else {
				obj[category] += amount;
			}
			return obj;
		}, {});
		let graphData = [];
		for (let key in totalCategoryExpenses) {
			let items = {
				Name: key,
				Value: totalCategoryExpenses[key]
			};
			graphData.push(items);
		}
		return graphData;
	}
}

function prepareGraph(graphData, graphClass) {
	let width = 460;
	let height = 360;
	let radius = Math.min(width, height) / 2;
	let color = d3.scale.category20();
	$(graphClass).empty();
	let svg = d3
		.select(graphClass)
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		.append('g')
		.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
	let arc = d3.svg
		.arc()
		.outerRadius(radius - 10)
		.innerRadius(radius - 80);
	let div = d3
		.select('body')
		.append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0);
	let pie = d3.layout
		.pie()
		.value(function (d, i) {
			return d.Value;
		})
		.sort(null);
	let path = svg
		.selectAll('path')
		.data(pie(graphData))
		.enter()
		.append('path')
		.attr('d', arc)
		.on('mouseover', function (d) {
			div
				.transition()
				.duration(0)
				.style('opacity', 0.9);
			div
				.html('Category: <br>' + d.data.Name + '<br/>Amount: ' + d.data.Value)
				.style('left', d3.event.pageX + 'px')
				.style('top', d3.event.pageY - 28 + 'px');
		})
		.on('mouseout', function (d) {
			div
				.transition()
				.duration(0)
				.style('opacity', 0);
		})
		.attr('fill', function (d, i) {
			return color(d.data.Name);
		});

	svg.append("text")
		.attr("dy", "-0.5em")
		.style("text-anchor", "middle")
		.attr("class", "inner-circle")
		.attr("fill", "#36454f")
		.text(function (d) {
			return 'Hover on';
		});
	svg.append("text")
		.attr("dy", "1.0em")
		.style("text-anchor", "middle")
		.attr("class", "inner-circle")
		.attr("fill", "#36454f")
		.text(function (d) {
			return 'graph for details';
		});
}

function getDailyExpense(day) {
	let token = localStorage.getItem('jwtToken');
	const request = {
		url: '/api/expenses/daily',
		method: 'POST',
		data: JSON.stringify({
			"date": day
		}),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		success: generateDailyGraphReport,
		error: function (err) {
			console.error(err);
		}
	};
	$.ajax(request);
}

function generateDailyGraphReport(data) {
	let totalAmount = 0;
	if (data.length > 0) {
		totalAmount = getTotalAmount(data, totalAmount);
		$('.card2').show();
		$('.dailyTotal').html(`$${totalAmount}`);
		let graphData = prepareCategoryExpensePair(data);
		prepareGraph(graphData, '.dailyGraphData');
	} else
		$('.dailyInfo').html("No records found for selected date");
}

$('#tabs').tabs({
	activate: function (event, ui) {
		if (ui.newTab.index() == 2) {
			getTotalExpenses();
			getBarGraph();
		}
	}
});

function getTotalExpenses() {
	let token = localStorage.getItem('jwtToken');
	const request = {
		url: '/api/expenses/totalExpenses',
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		success: generateTotalExpenseReport,
		error: function (err) {
			console.log(err);
		}
	};
	$.ajax(request);
}

function generateTotalExpenseReport(data) {
	if (data.length > 0) {
		let graphData = prepareCategoryExpensePair(data);
		prepareGraph(graphData, '.totalExpenseGraph');
	} else
		$('.totalInfo').html("No records found");
}

function getBarGraph() {
	let token = localStorage.getItem('jwtToken');
	const request = {
		url: '/api/expenses/groupExpense',
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		success: createBarGraph,
		error: function (err) {
			console.log(err);
		}
	};
	$.ajax(request);
}

function createBarGraph(data) {
	let svgWidth = 600;
	let svgHeight = 300;

	let heightPad = 50;
	let widthPad = 50;

	$('.barGraph').empty();
	let svg = d3
		.select('.barGraph')
		.append('svg')
		.attr('width', svgWidth + widthPad * 2)
		.attr('height', svgHeight + heightPad * 2)
		.append('g')
		.attr('transform', 'translate(' + widthPad + ',' + 40 + ')');

	//Set up scales
	let xScale = d3.scale
		.ordinal()
		.domain(
			data.map(function (d) {
				return d._id;
			})
		)
		.rangeRoundBands([0, svgWidth], 0.1);

	let yScale = d3.scale
		.linear()
		.domain([
			0,
			d3.max(data, function (d) {
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
		.attr('x', function (d) {
			return xScale(d._id) + widthPad;
		})
		.attr('y', function (d) {
			return yScale(d.Total);
		})
		.attr('height', function (d) {
			return svgHeight - yScale(d.Total);
		})
		.attr('width', xScale.rangeBand())
		.attr('fill', 'blue');

	// Y axis
	let yAxis = d3.svg
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
	let xAxis = d3.svg
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

$('#main').on('click', '.js-delete', function () {
	let confirm = window.confirm('Are you sure you want to delete?');
	if (confirm == true) {
		let expenseId = $(this)
			.closest('tr')
			.attr('data');
		$(this)
			.closest('tr')
			.remove();
		deleteExpense(expenseId);
	}
});

function deleteExpense(expenseId) {
	let token = localStorage.getItem('jwtToken');
	let request = {
		url: `/api/expenses/${expenseId}`,
		type: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		error: function (err) {
			console.log(JSON.stringify(err));
		}
	};
	$.ajax(request);
}

function onSuccessFullDeletion() {
	alert('Record deleted successfully');
}