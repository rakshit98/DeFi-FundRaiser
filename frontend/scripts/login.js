
(function ($) {
    "use strict";


    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit',function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }

        return check;
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    

})(jQuery);


$(document).delegate('.balancebtn', 'click', function()
{
    console.log("clicked");
        var target = $(this);
        console.log(target.data('index'));
        var ind = target.data('index');
        var targetamount = target.data('target');
        var bal;
        // var par = target.parent();
        // console.log(par.data('name'));
        var str = "/ngo/fbalance?fund_id=" + ind;
        $.get(str,function(data){
            console.log(data);
            bal = data.bal;
            $(this).html = "hello";
            alert("Balance: " + bal+ "/" + targetamount);
        });
});

$(document).delegate('.donatebtn', 'click', function()
{
    var target = $(this);
    console.log("clicked");
    var fundname = target.data('name');
    console.log(fundname);
    var corresinput = $('#amount-'+fundname);
    console.log(corresinput);
    var amount = corresinput.val();
    if(!amount){
        alert("Amount cannot be empty");
        return;
    }
    else if(isNaN(amount)){
        alert("Amount has to be a number");
        return;
    }

        var ind = target.data('index');
        console.log(ind);
        console.log(amount);
        // var par = target.parent();
        // console.log(par.data('name'));
        $.ajax({
            type: "POST",
            url: '/donorhome/donate',
            dataType: 'json',
            data: {
                "fund_id": ind,
                "amount": amount
            }
        }).done(function (data) {
                    console.log(data);
                    alert("Transferred!");

                });
});