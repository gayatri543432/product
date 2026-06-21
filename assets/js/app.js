
const productForm=document.getElementById('productForm')
const titleControl=document.getElementById('title')
const descriptionControl=document.getElementById('description')
const imageControl=document.getElementById('image')
const addBtn=document.getElementById('addBtn')
const updateBtn=document.getElementById('updateBtn')
const productContainer=document.getElementById('productContainer')
const spinner=document.getElementById('spinner')

let productArr=[]

let BASE_URL='https://fakestoreapi.com'
let POST_URL=`${BASE_URL}/products`

function snackBar(msg,i){
    Swal.fire({
        title:msg,
        icon:i,
        timer:3000
    })
}
function tooltips(){
     $('[data-toggle="tooltip"]').tooltip()
}
function makeApiCall(method,api_url,body=null,successCb,errorCb){
    spinner.classList.remove('d-none')

    let xhr=new XMLHttpRequest()
    xhr.open(method,api_url)
    xhr.send(body?JSON.stringify(body):null)
    xhr.onload=function(){
        if(xhr.status>=200 && xhr.status<=299){
            let res=JSON.parse(xhr.response)
            if(method==='GET' && Array.isArray(res)){
                successCb(res.reverse())
            }else if(method==='POST'){
                successCb(body,res.id)
            }else if(method==='GET'){
                successCb(res)
            }else if(method==='PATCH' || method==='PUT'){
                successCb(body)
            }
            else{
                successCb()
            }
        }else{
            errorCb(xhr.response)
        }
        spinner.classList.add('d-none')
    }
}

function templating(arr){
    let res=''
    arr.forEach(p=>{
        res +=`<div class="col-md-4 mt-5" id="${p.id}">
                <div class="card h-100">
                    <div class="card-header" data-toggle="tooltip" data-placement="top" title="${p.title}">
                        <h3>${p.title}</h3>
                    </div>
                    <div class="card-body">
                        <img src="${p.image}">
                        <p>${p.description}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <i class="fa-solid fa-pen-to-square fa-2x text-primary"
                        onclick="onEdit(this)"></i>
                        <i class="fa-regular fa-trash-can fa-2x text-danger"
                        onclick="onRemove(this)"></i>
                    </div>
                </div>
            </div>`
    })
    productContainer.innerHTML=res
    tooltips()
}
makeApiCall('GET',POST_URL,null,templating,snackBar)


function onSubmitProduct(ele){
    
    ele.preventDefault()
    let New_product={
        title:titleControl.value ,
        description:descriptionControl.value,
        image:imageControl.value
    }

    makeApiCall('POST',POST_URL,New_product,createcard,snackBar)
}

function createcard(res,i){
    let card=document.createElement('div')
    card.className='col-md-4 mt-5'
    card.id=i;
    card.innerHTML=`
    <div class="card h-100">
                    <div class="card-header" data-toggle="tooltip" data-placement="top" title="${res.title}">
                        <h3>${res.title}</h3>
                    </div>
                    <div class="card-body">
                        <img src="${res.image}">
                        <p>${res.description}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <i class="fa-solid fa-pen-to-square fa-2x text-primary"
                        onclick="onEdit(this)"></i>
                        <i class="fa-regular fa-trash-can fa-2x text-danger"
                        onclick="onRemove(this)"></i>
                    </div>
                </div>`
        productContainer.prepend(card);
        tooltips()
        productForm.reset()
        snackBar(`New Product with ID ${card.id} created..`,'success')
}

function onRemove(eve){
       let Remove_id= eve.closest('.col-md-4').id
       localStorage.setItem('Remove_id',Remove_id)
       Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
    }).then((result) => {
    if (result.isConfirmed) {
        let remove_url=`${BASE_URL}/products/${Remove_id}`
        makeApiCall('DELETE',remove_url,null,remoceCard,snackBar)
    }
    });
    }

function remoceCard(){
    let remove_card=localStorage.getItem('Remove_id')
    document.getElementById(remove_card).remove()

    snackBar(`Product with ID ${remove_card} removed..`,'success')

}

function onEdit(ele){
    let edit_id=ele.closest('.col-md-4').id
    localStorage.setItem('edit_id',edit_id)
    let edit_url=`${BASE_URL}/products/${edit_id}`

    makeApiCall('GET',edit_url,null,patchDataUi,snackBar)
}

function patchDataUi(res){
    
    titleControl.value=res.title;
    descriptionControl.value=res.description;
    imageControl.value=res.image;

    productForm.scrollIntoView({
        behavior:'smooth',
        block:'center'
    })

    addBtn.classList.add('d-none')
    updateBtn.classList.remove('d-none')

}

function onUpdate(){
    let update_id=localStorage.getItem('edit_id')
    let update_url=`${BASE_URL}/products/${update_id}`
    let update_obj={
        title:titleControl.value ,
        description:descriptionControl.value,
        image:imageControl.value,
        id:update_id

    }

    makeApiCall('PATCH',update_url,update_obj,updateOnUI,snackBar)
}


function updateOnUI(res){
    
    let card=document.getElementById(res.id)
    card.querySelector('.card-header h3').innerHTML=res.title;
    card.querySelector('.card-body p').innerHTML=res.description;
    card.querySelector('.card-body img').innerHTML=res.imgage;

    card.classList.add('bg')
    card.scrollIntoView({
        behavior:'smooth',
        block:'center'
    })
    setTimeout(() => {
     card.classList.remove('bg')
        
    }, 3000);
    productForm.reset()
    addBtn.classList.remove('d-none')
    updateBtn.classList.add('d-none')

    snackBar(`Product with Id ${res.id} updated..`,'success')
}
productForm.addEventListener('submit',onSubmitProduct)
updateBtn.addEventListener('click',onUpdate)