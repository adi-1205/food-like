class Handlers {
    static loginPage() {
        $('#login-btn').click(async function () {
            try {

                let email = $('#email').val()
                let password = $('#password').val()

                if (!validator.isEmail(email))
                    toastr.error('Enter valid email')
                else {
                    let data = await Helpers.ajx('/auth/login', {
                        formData: {
                            email,
                            password
                        }
                    })
                    if (data.redirect)
                        location.href = data.redirect
                }
            } catch (err) {
                console.log(err);
                toastr.error(err.responseJSON.message)
            }
        })
    }

    static registerPage() {
        $('#register-btn').click(async function () {
            console.log('regester');
            try {

                let email = $('#email').val()
                let password = $('#password').val()

                if (!validator.isEmail(email))
                    toastr.error('Enter valid email')
                if (password.length < 5)
                    toastr.error('Create strong password')

                else {
                    let data = await Helpers.ajx('/auth/register', {
                        formData: {
                            email,
                            password
                        }
                    })
                    if (data.redirect)
                        location.href = data.redirect
                }
            } catch (err) {
                console.log(err);
                toastr.error(err.responseJSON.message)
            }
        })
    }

    static invitesPage() {
        $('#invite-user-modal-btn').click(_ => $('#modal').modal('show'))

        $('#invite-user-btn').click(async function () {
            let email = $('#email-inp').val()
            let restName = $('#rest-name-inp').val()

            if (!validator.isEmail(email))
                return toastr.error('Invalid email address')
            if (restName === '' || restName.length < 5)
                return toastr.error('Restaurant name should be atleast 5 chars long')

            let data = await Helpers.tryCatchedAjax('/admin', {
                formData: {
                    email,
                    restName
                }
            })
            if (data.success) {
                toastr.success(data.message)
                $('#modal').modal('hide')
            }
        })
    }

    static verifyPage() {
        $('#verify-invite-btn').click(async function () {
            let password = $('#password').val()
            let cpassword = $('#cpassword').val()

            if (password.length < 5)
                return toastr.error('Password should be atleast 5 chars long')

            if (password !== cpassword)
                return toastr.error('Passwords and confirm password should be same')

            let token = $('#token').val()

            let data = await Helpers.tryCatchedAjax(`/auth/verify/${token}`, {
                formData: {
                    password,
                    cpassword
                }
            })

            if (data.success) {
                toastr.success('Account verified')
            }

        })
    }

    static menuPage() {
        $('#add-to-menu-modal-btn').click(function () {
            $('#modal').modal('show')
        })

        $('#req-to-add-btn').click(async function () {
            let name = $('#name-inp').val()
            let price = $('#price-inp').val()
            let file = $('#image-inp')[0].files[0]
            let desc = $('#desc-inp').val()

            console.log(desc);
            if (!name || price === '' || !file || !desc)
                return toastr.error('Add all fields')
            if (isNaN(parseFloat(price)))
                return toastr.error('Price should be numeric')

            let formData = new FormData()

            formData.append('name', name)
            formData.append('price', parseFloat(price))
            formData.append('desc', desc)
            formData.append('image', file)

            let data = await Helpers.tryCatchedAjax('/user', {
                extend: {
                    contentType: false,
                    processData: false,
                    data: formData
                }
            })

            if (data.success) {
                $('#modal').modal('hide')
                toastr.success('Request Sent!')
            }
        })

        $('.remove-from-menu').click(async function () {
            let id = $(this).data('id')

            let data = await Helpers.tryCatchedAjax(`/user/${id}`, {
                method: 'delete'
            })
            if (data.success) {
                $(this).closest('.menu-item').remove()
                toastr.success('Item removed')
            }
        })
    }

    static requestsPage() {
        $('.approve-btn').click(async function () {
            console.log('click');
            let id = $(this).data('id')
            let data = await Helpers.tryCatchedAjax(`/admin/approve/${id}`, { method: 'put' })

            if (data.success) {
                toastr.success('Item approved')
                $(this).parent().parent().remove()
            }
        })
    }

    static async restaurantPage() {
        await Cart.init()
        $('.add-to-cart').click(async function () {
            let id = $(this).data('id')
            let qty = $(this).parent().parent().find('.qty').val()
            await Cart.addToCart(qty, id)
        })
    }

    static orderPage() {
        $('#order-btn').click(async function () {
            let data = await Helpers.tryCatchedAjax('/order', { method: 'get' })

            if (data.url)
                location.href = data.url
        })
    }
}

class Cart {
    static async init() {
        console.log('CART INITIALIZING');
        let isLoggedIn = !!Helpers.getCookie('auth')
        if (isLoggedIn) {
            let storeString = localStorage.getItem('store')

            if (!storeString) return

            let store = JSON.parse(storeString)
            
            if (!isArray(store) || store.length == 0) return

            let data = await Helpers.tryCatchedAjax('/cart', {
                formData: {
                    items: store
                }
            })
        }

        this.emptyLocal()
    }

    static emptyLocal() {
        if (localStorage.getItem('store'))
            localStorage.removeItem('store')
    }

    static async addToCart(qty, id) {
        let isLoggedIn = !!Helpers.getCookie('auth')
        if (!isLoggedIn) {
            let storeString = localStorage.getItem('store')
            let store
            if (!storeString) {
                store = []
            } else {
                store = JSON.parse(storeString)
            }

            let ind = store.findIndex(s => s.id === id)
            if (ind != -1) {
                store[ind] = { qty, id }
            } else {
                store.push({ qty, id })
            }
            localStorage.setItem('store', JSON.stringify(store))

            console.log(localStorage.getItem('store'));
        } else {
            let data = await Helpers.tryCatchedAjax('/cart', {
                formData: {
                    items: [{ qty, id }]
                }
            })
            if (data.success) {
                toastr.success('Item added to cart')
            }
        }
    }
}

class Helpers {
    static ajx(url, { ...opt }) {
        if (!opt.extend) {
            opt['extend'] = {}
        }
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                type: opt.method ? opt.method : 'post',
                data: JSON.stringify(opt.formData),
                contentType: 'application/json',
                ...opt.extend,
                success: (data) => {
                    if (opt.cb) opt.cb()
                    resolve(data)
                },
                error: (err) => {
                    console.log(err);
                    reject(err)
                }
            });
        })
    }

    static async tryCatchedAjax(url, opt = {}) {
        try {
            let data = await this.ajx(url, { ...opt })
            return data
        } catch (err) {
            console.log(err);
            toastr.error(err.responseJSON.message)
        }
    }

    static paginationController(totalCount = false) {
        let url = new URLHandler(window.location.href)
        let currentPage = url.getParam('page') || 1
        if (
            url.pathname.match(/admin\/games\/?/i) ||
            url.pathname.match(/admin\/?/i)
        ) {
            let count = +(totalCount || $('#count').val())
            var paginator = pagination.create('search', {
                prelink: url.deleteParam('page'),
                current: currentPage,
                rowsPerPage: url.getParam('limit') || 10,
                totalResult: count
            });
            let pageData = paginator.getPaginationData()
            console.log(pageData);
            let pageHtml = `<ul class="pagination justify-content-center">`
            pageHtml += `<li class="page-item ${pageData.previous ? '' : 'disabled'}">
            <a class="page-link" href="${pageData.previous ? pageData.prelink + 'page=' + pageData.previous : '#'}">Previous</a>
            </li>`
            for (let n of pageData.range) {
                pageHtml += `<li class="page-item ${n == pageData.current ? 'active' : ''}">
                <a class="page-link " 
                href="${pageData.prelink + 'page=' + n} ">
                ${n}
                </a>
                </li>`
            }
            pageHtml += `<li class="page-item ${pageData.next ? '' : 'disabled'}">
                    <a class="page-link" href="${pageData.next ? pageData.prelink + 'page=' + pageData.next : '#'}">Next</a>
                    </li>`

            $('#pagination-area').html('').html(pageHtml)
        }
    }

    static getCookie(name) {
        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
    }
}
class URLHandler {
    constructor(href) {
        this.href = href;
        const url = new URL(href);
        this.pathname = url.pathname
        this.params = Object.fromEntries(url.searchParams.entries());
    }

    hasParam(paramName) {
        return paramName in this.params;
    }

    getParam(paramName) {
        return this.params[paramName];
    }

    setParam(paramName, paramValue) {
        this.params[paramName] = paramValue;
        this.updateHref();
    }

    deleteParam(paramName) {
        delete this.params[paramName];
        this.updateHref();
        return this.href
    }

    updateHref() {
        const searchParams = new URLSearchParams(this.params);
        const newHref = (searchParams.size
            ?
            this.href.split("?")[0] + "?" + searchParams.toString() + "&"
            :
            this.href.split("?")[0] + "?" + searchParams.toString()
        )
        this.href = newHref;
    }
}
