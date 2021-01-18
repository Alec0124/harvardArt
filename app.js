// ***Global Constants***
const BASE_URL = 'https://api.harvardartmuseums.org';
const KEY = 'apikey=c92d8284-cb5f-4ceb-b9ae-259680172691'; // USE YOUR KEY HERE

// ***Helper Functions***
function onFetchStart() {
    $('#loading').addClass('active');
}
const factSpan = (title, content) => {
    return $(`<span class="title">${title}</span>
    <span class="content">${content}</span>`)
}

function onFetchEnd() {
    $('#loading').removeClass('active');
}

// ***Functions***

const bootStrap = () => {
    prefetchCategoryLists();
}

async function fetchObjects() {
    const url = `${BASE_URL}/object?${KEY}`;

    onFetchStart();

    try {
        const response = await fetch(url);
        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
    } finally {
        onFetchEnd();
    }
}

async function fetchAllCenturies() {
    const url = `${BASE_URL}/century?${KEY}&size=100&sort=temporalorder`;

    if (localStorage.getItem('centuries')) {
        return JSON.parse(localStorage.getItem('centuries'));
    }

    onFetchStart();

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        const records = data.records;
        console.log(records);

        localStorage.setItem('centuries', JSON.stringify(records));

        return records;
    } catch (error) {
        console.error(error);
    } finally {
        onFetchEnd();
    }
}

async function fetchAllClassifications() {
    const url = `${BASE_URL}/classification?${KEY}&size=100&sort=name`;

    if (localStorage.getItem('classifications')) {
        return JSON.parse(localStorage.getItem('classifications'));
    }

    onFetchStart();

    try {
        const response = await fetch(url);
        const data = await response.json();

        const records = data.records;


        localStorage.setItem('classifications', JSON.stringify(records));

        return records;
    } catch (error) {
        console.error(error);
    } finally {
        onFetchEnd();
    }
}

async function prefetchCategoryLists() {
    try {
        const [
            classifications, centuries
        ] = await Promise.all([
            fetchAllClassifications(),
            fetchAllCenturies()
        ]);

        // This provides a clue to the user, that there are items in the dropdown
        $('.classification-count').text(`(${classifications.length})`);

        classifications.forEach(classification => {
            newOption = $(`<option value="${classification.name}">${classification.name}</option>`);
            $('#select-classification').append(newOption);

        });

        // This provides a clue to the user, that there are items in the dropdown
        $('.century-count').text(`(${centuries.length}))`);

        centuries.forEach(century => {
            newOption = $(`<option value="${century.name}">${century.name}</option>`);
            $('#select-century').append(newOption);
        });

    } catch (error) {
        console.error(error);
    }
}

const buildSearchString = () => {
    const classification = $('#select-classification').val();
    const century = $('#select-century').val();
    const keyword = $('#keywords').val();

    return encodeURI(`${BASE_URL}/object?${KEY}&classification=${classification}&century=${century}&keyword=${keyword}`);
}

function renderPreview(record) {
    const description = record.description;
    const primaryImageUrl = record.primaryimageurl;
    const title = record.title;
    const template = $(`<div class="object-preview">
    <a href="#">
      <img src="${primaryImageUrl}" />
      <h3>${title}</h3>
      <h3>${description}</h3>
    </a>
    </div>`);
    template.data('record', record);
    return template;

}


function updatePreview(records, info) {
    const root = $('#preview');
    const results = root.children('.results');
    results.html('');

    if (info.next) {
        root.find('.next').data('url', info.next).attr('disabled', false);
    } else {
        root.find('.next').data('url', null).attr('disabled', true);
    }

    if (info.prev) {
        root.find('.previous').data('url', info.prev).attr('disabled', false);
    } else {
        root.find('.previous').data('url', null).attr('disabled', true);
    }

    records.forEach(item => {
        results.append(renderPreview(item));
    })

}

const renderFeature = record => {

    const { title, dated, description, culture, style, technique, medium, dimensions, people, department, division, contact, creditline, images, primaryimageurl } = record;




    const template = $(`<div class="object-feature">
    <header>
      <h3>${title}</h3>
      <h4>${dated}</h4>
    </header>
  </div>`);

    const photos = $('<section class="photos">');
    images.forEach(item => {
        photos.append($(`<img src="${item.baseimageurl}" />`))
    });

    const facts = $('<section class="facts">');
    if (description) {
        facts.append(factSpan('Description', description));
    }
    if (culture) {
        facts.append(factSpan('Culture', culture));
    }
    if (style) {
        facts.append(factSpan('Style', style));
    }
    if (technique) {
        facts.append(factSpan('Technique', technique));
    }
    if (medium) {
        facts.append(factSpan('Medium', medium));
    }
    if (dimensions) {
        facts.append(factSpan('Dimensions', dimensions));
    }
    if (people) {
        facts.append(factSpan('People', people));
    }
    if (department) {
        facts.append(factSpan('Department', department));
    }
    if (division) {
        facts.append(factSpan('Division', division));
    }
    if (contact) {
        facts.append(factSpan('Contact', contact));
    }
    if (creditline) {
        facts.append(factSpan('Creditline', creditline));
    }

    template.append(facts).append(photos);

    return template;

}

// ***Event Listeners***
$('#search').on('submit', async function (event) {

    event.preventDefault();

    onFetchStart();

    try {

        const url = buildSearchString();

        const response = await fetch(url);
        const data = await response.json();
        const records = data.records;
        const info = data.info;
        updatePreview(records, info);

    } catch (error) {
        // log out the error
    } finally {
        onFetchEnd();
    }
});

$('#preview .next, #preview .previous').on('click', async function () {
    const url = $(this).data('url');

    onFetchStart();

    try {
        const response = await fetch(url);
        const data = await response.json();
        const records = data.records;
        const info = data.info;
        updatePreview(records, info);
    } catch (error) {
        // log out the error
    } finally {
        onFetchEnd();
    }

});

$('#preview').on('click', '.object-preview', function (event) {
    event.preventDefault(); // they're anchor tags, so don't follow the link
    const objectPreview = $(this).closest('.object-preview');
    const record = objectPreview.data('record');
    $('#feature').html('');
    $('#feature').append(renderFeature(record));
});

// ***Initialize***
bootStrap();