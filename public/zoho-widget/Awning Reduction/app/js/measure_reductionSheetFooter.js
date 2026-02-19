function    measure_reductionSheetFooter(type){
    let date = new Date()
    let temp = ``
if(type === 'reduction'){
  temp = `
    <div class="" id='reductionFooter'>
        <div class="footerInfo" >
            <div class="footerCol">Sewn By:___________________ Date:____________________</div>
            <div class="footerCol">Assembled By:___________________ Date:____________________</div>
            <div class="footerCol">Form Revised ${date.getMonth() + 1}/${date.getFullYear()} Printed ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}</div>
            <div class="footerCol">Final Prep By:___________________ Date:____________________</div>
        </div>
    </div>
    `
} 
else{
    temp = `
    <div class="mainFooterWrapper" id='measureFooter'>
    <div class="footerInfo" >
        <div class='row mt-3 w-100'>
            <div class="col">Customer Signature:_______________________________________</div>
            <div class="col">Date:____________________</div>
        </div>
        <div class="row mt-3">
            <div class="col">Signature indicates acceptance of Liberty Home Products measuring policies and final approval of all measurements.</div>
            <div style="font-size: 22px; margin-top:15px">
            <p>
                    ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}   ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}
            </p>        
            </div>
        </div>
        </div>
    </div>`
}
return temp
}