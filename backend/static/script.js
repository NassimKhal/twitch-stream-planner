document.addEventListener('DOMContentLoaded', function() {
    console.log("Welcome to the Streamer Management Platform!");

    $('#downloadSchedule').on('click', function() {
        showConfirmationModal();
    });

    $('#confirmDownload').on('click', function() {
        downloadSchedule();
    });

    $('#publishToTwitter').on('click', function() {
        $.ajax({
            url: '/is_twitter_linked',
            method: 'GET',
            success: function(response) {
                if (response.twitter_linked) {
                    showTwitterPreview();
                } else {
                    if (confirm('Votre compte Twitter n\'est pas lié. Voulez-vous le lier maintenant ?')) {
                        window.location.href = '/link_twitter';
                    }
                }
            },
            error: function(error) {
                console.error('Error checking Twitter link status:', error);
            }
        });
    });

    $('#backgroundImage').on('change', function() {
        if (this.files && this.files[0]) {
            let reader = new FileReader();
            reader.onload = function(e) {
                let img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    let canvas = document.createElement('canvas');
                    canvas.width = 1902;
                    canvas.height = 1080;
                    let ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    $('#scheduleContainer').data('background', canvas.toDataURL());
                };
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    function generateDayRows() {
        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        let dayRowsHtml = '';
        days.forEach((day, index) => {
            dayRowsHtml += 
                `<div class="day-column">
                    <div class="day-header"><strong>${day} :</strong></div>
                    <div class="form-group">
                        <label for="startTime${index}">Heure de début</label>
                        <input type="text" id="startTime${index}" class="form-control time-picker" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label for="startMinute${index}" class="minutes-picker-label">Minutes de début</label>
                        <select id="startMinute${index}" class="form-control minutes-picker">
                            <option value="00">00</option>
                            <option value="30">30</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="endTime${index}">Heure de fin</label>
                        <input type="text" id="endTime${index}" class="form-control time-picker" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label for="endMinute${index}" class="minutes-picker-label">Minutes de fin</label>
                        <select id="endMinute${index}" class="form-control minutes-picker">
                            <option value="00">00</option>
                            <option value="30">30</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="theme${index}">Thème</label>
                        <input type="text" id="theme${index}" class="form-control" placeholder="Entrer le thème du stream">
                    </div>
                    <button type="button" class="btn btn-primary save-slot" data-index="${index}">Valider</button>
                    <div id="slots${index}"></div>
                </div>`;
        });
        $('#dayRowsContainer').html(dayRowsHtml);
        initTimePickers();
    }

    function initTimePickers() {
        $('.time-picker').clockpicker({
            autoclose: true,
            twelvehour: false,
            placement: 'bottom',
            align: 'left',
            donetext: 'Done'
        });
    }

    $(document).on('click', '.save-slot', function() {
        let index = $(this).data('index');
        let startTime = $(`#startTime${index}`).val() + ':' + $(`#startMinute${index}`).val();
        let endTime = $(`#endTime${index}`).val() + ':' + $(`#endMinute${index}`).val();
        let theme = $(`#theme${index}`).val();

        if (!startTime || !endTime || !theme) {
            alert('Tous les champs doivent être remplis.');
            return;
        }

        let slotHtml = `<div>${startTime} - ${endTime} : ${theme} <button class="btn btn-danger btn-sm remove-slot">x</button></div>`;
        $(`#slots${index}`).append(slotHtml);

        $(`#startTime${index}`).val('');
        $(`#startMinute${index}`).val('00');
        $(`#endTime${index}`).val('');
        $(`#endMinute${index}`).val('00');
        $(`#theme${index}`).val('');
    });

    $(document).on('click', '.remove-slot', function() {
        $(this).parent().remove();
    });

    function showConfirmationModal() {
        html2canvas(document.querySelector("#scheduleContainer")).then(canvas => {
            document.getElementById('schedulePreview').innerHTML = '';
            document.getElementById('schedulePreview').appendChild(canvas);
            $('#confirmationModal').modal('show');
        });
    }

    function downloadSchedule() {
        html2canvas(document.querySelector("#scheduleContainer")).then(canvas => {
            let link = document.createElement('a');
            link.download = 'schedule.jpg';
            link.href = canvas.toDataURL();
            link.click();
            saveSchedule(); 
            $('#confirmationModal').modal('hide');
        });
    }

    function showTwitterPreview() {
        html2canvas(document.querySelector("#scheduleContainer")).then(canvas => {
            document.getElementById('twitterSchedulePreview').innerHTML = '';
            document.getElementById('twitterSchedulePreview').appendChild(canvas);
            $('#twitterPreviewModal').modal('show');
        });
    }

    $('#confirmTwitterPublish').on('click', function() {
        let message = $('#twitterMessage').val();
        html2canvas(document.querySelector("#scheduleContainer")).then(canvas => {
            let imageData = canvas.toDataURL('image/jpeg');
            $.ajax({
                url: '/publish_to_twitter',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ message: message, image: imageData }),
                success: function(response) {
                    alert('Planning publié sur Twitter avec succès !');
                    $('#twitterPreviewModal').modal('hide');
                },
                error: function(error) {
                    console.error('Error publishing to Twitter:', error);
                    alert('Erreur lors de la publication sur Twitter.');
                }
            });
        });
    });

    function saveSchedule() {
        html2canvas(document.querySelector("#scheduleContainer")).then(canvas => {
            let imageData = canvas.toDataURL('image/jpeg');
            $.ajax({
                url: '/save_schedule',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ image: imageData }),
                success: function(response) {
                    console.log('Planning enregistré avec succès');
                },
                error: function(error) {
                    console.error('Erreur lors de l\'enregistrement du planning:', error);
                }
            });
        });
    }

    generateDayRows();
});
