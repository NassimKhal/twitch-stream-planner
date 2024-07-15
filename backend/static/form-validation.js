$(document).ready(function() {
    function validateSlots() {
        let isValid = true;
        $('.day-column').each(function() {
            const index = $(this).find('.save-slot').data('index');
            const startTime = $(`#startTime${index}`).val();
            const endTime = $(`#endTime${index}`).val();
            const theme = $(`#theme${index}`).val();

            if (!startTime || !endTime || !theme || startTime === '' || endTime === '' || theme.length < 3) {
                isValid = false;
                alert('Tous les champs doivent être remplis correctement. Le thème doit comporter au moins 3 caractères.');
                return false;
            }

            const startDateTime = new Date(`1970-01-01T${startTime}:00`);
            const endDateTime = new Date(`1970-01-01T${endTime}:00`);
            if (startDateTime >= endDateTime) {
                isValid = false;
                alert('L\'heure de début doit être avant l\'heure de fin.');
                return false;
            }
        });
        return isValid;
    }

    $(document).on('click', '.save-slot', function() {
        if (!validateSlots()) {
            return false;
        }

        const index = $(this).data('index');
        let startTime = $(`#startTime${index}`).val();
        let endTime = $(`#endTime${index}`).val();
        let theme = $(`#theme${index}`).val();

        let slotHtml = `<div>${startTime} - ${endTime} : ${theme} <button class="btn btn-danger btn-sm remove-slot">x</button></div>`;
        $(`#slots${index}`).append(slotHtml);

        $(`#startTime${index}`).val('');
        $(`#endTime${index}`).val('');
        $(`#theme${index}`).val('');
    });

    $(document).on('click', '.remove-slot', function() {
        $(this).parent().remove();
    });

    $('#scheduleForm').submit(function(event) {
        event.preventDefault();
        if (validateSlots()) {
            this.submit();
        }
    });
});
