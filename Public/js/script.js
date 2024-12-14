function randomKeyGenerator(){
    const Randomkey = Math.floor(Math.random() * 9000000000000) + 1000000000000;
    const currentDate = new Date();
    const milliseconds = currentDate.getMilliseconds();
    const key = Number(String(Randomkey) + String(milliseconds));
    return key;
};

$(".add-blog-btn").click(function() {

    const blogKey = randomKeyGenerator();
    const titleInput = $(".title-input").val();
    const textInput = $(".text-blog-input").val();

    $.ajax({
        url:'/addblog-to-homePage',
        method: 'POST',
        data: {
            title: titleInput,
            content: textInput,
            date: new Date().toLocaleDateString(),
            key: blogKey
        },
        success: function(response){
            $(".title-input").val("");
            $(".text-blog-input").val("");
            window.location.href = response.redirectUrl;
        },
        error: function(xhr, status, error) {
            $(".form-validation-addblog").text("Please ensure that you fill in the empty space.")
        }
    });
});

$(".delelteBlogBtn").click(function() {   
    const btnKey = $(this).attr("data-key");
    $.ajax({
        url:'/deleteBlog',
        method: 'POST',
        data: {
            dataKey: btnKey
        },
        success: function(res){
            // location.reload();
            $("tr").each(function() {
                const rowKey = $(this).find(".delelteBlogBtn").data("key");
                if (rowKey == btnKey) {
                    $(this).remove();
                }
            });
            if($("table.blogs tr").length === 0){
                $("table.blogs").hide();
                $("main").append(`
                    <div class="notFound-result">
                        <img src="/images/1400397-200.png">
                        <h1 style="font-size: 2.3rem;">No blog has been added.</h1>
                    </div>`
                );
            }
        }
    });
});

$(".editBlogBtn").click(function() {
    const btnKey = $(this).attr("data-key");
    $.ajax({
        url:'/show-blog-in-edit-page',
        method: 'POST',
        data: {
            dataKey: btnKey
        },
        success: function(response){
            window.location.href = response.redirectUrl;
        }
    });
});

$(".confirmEditBtn").click(function() {
    const btnKey = $(this).attr("data-key");
    console.log(btnKey)
    const newTitle = $(".title-input-edit-js").val();
    const newContent = $(".textarea-js").val();
    $.ajax({
        url: '/do-the-edit',
        method: 'POST',
        data: {
            btnKey: btnKey,
            newTitle: newTitle,
            newContent: newContent,
            date: new Date().toLocaleDateString(),
        },
        success: function(response){
            if(response.message == "You must change something!")
                $(".form-validation-editBlog").text(response.message);
            else if(response.message != "You must change something!")
                window.location.href = response.redirectUrl;
        },
        error: function(xhr, status, error) {
            console.log("There is an error here bud: " + error);
        }
    })
});

$(".viewBlogBtn").click(function() {
    const btnKey = $(this).attr("data-key");
    $.ajax({
        url:'/view-blog-server',
        method: 'POST',
        data: {
            dataKey: btnKey
        },
        success: function(response) {
            if(response.redirectUrl) {
                window.location.href = response.redirectUrl;
            }
        }
    });
});


$("#search-bar").off('input').on('input', function(event) {

    const searchBar = $('#search-bar');
    const searchResults = $('#search-results');
    const query = searchBar.val().trim().toLowerCase();
    
    searchResults.empty();

    $.ajax({
        url:'/search-func',
        method: 'POST',
        data: {
            input: query
        },
        success: function(response) {

            response.filteredData.forEach(data => {
                let  previewTitle; 
                    if (data.title.length > 25) {
                            previewTitle = data.title.slice(0, 25);
                            previewTitle = previewTitle + "...";
                    } 
                    else {
                        previewTitle = data.title;
                    }
                const html = `<li class="search-result-item" value="${response.filteredData[0].key}">${previewTitle}</li>`;
                searchResults.append(html);
            });

            searchResults.show();

            if(query === ""){
                searchResults.empty();
            }

            function hideSearchResults() {
                searchResults.hide();
            }
            
            function showSearchResults() {
                searchResults.show();
            }
            
            searchBar.on('focus input', showSearchResults);
            
            $(document).on('click', function(event) {
                if (!searchBar.is(event.target) && !searchResults.is(event.target) && searchResults.has(event.target).length === 0) {
                    hideSearchResults();
                }
            });
        }
    });
});

$(document).on('click', '.search-result-item', function(){
    const blogKey = $(this).attr('value');
    $.ajax({
        url:'/view-blog-server',
        method: 'POST',
        data:{
            dataKey: blogKey
        },
        success: function(response){
            window.location.href = response.redirectUrl;
        },
        error: function(error){
            console.log("Error viewing blog", error);
        }
    })
})




