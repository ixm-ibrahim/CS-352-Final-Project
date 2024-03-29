module.exports = function()
{
    var express = require('express');
    var router = express.Router();
	
	/* Display all patients */
	router.get('/', function(req, res)
	{
		/* SELECT
		 * 		SSN,
		 *		first_name,
		 *		last_name,
		 *		DATE_FORMAT(birthdate, '%m/%d/%Y') AS birthdate
		 * FROM
		 * 		patient
		 */
		req.app.get('mysql').pool.query("SELECT SSN, first_name, last_name, DATE_FORMAT(birthdate, '%m/%d/%Y') AS birthdate FROM patient", function(error, results, fields)
		{
            if(error)
			{
				console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
				res.redirect('500',
				{
					error: JSON.stringify(error)
				});
            }
			
            res.render('patient',
			{
				title: "Patients",
				jsscripts: ["checkPatient.js"],
				patient: results
			});
        });
    });
	
	/* Inserts a new patient */
    router.post('/', function(req, res)
	{
        /* INSERT INTO patient
		 * 		(SSN, first_name, last_name, birthdate)
		 * VALUES
		 * 		(?, ?, ?, ?)
		 */
        req.app.get('mysql').pool.query("INSERT INTO patient (SSN, first_name, last_name, birthdate) VALUES (?, ?, ?, ?)", [req.body.SSN, req.body.first_name, req.body.last_name, req.body.birthdate], function(error, results, fields)
		{
            if(error)
			{
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
				res.redirect('500',
				{
					error: JSON.stringify(error)
				});
            }
			
			res.redirect('/patient');
        });
		
    });
	
	/* Displays page for accessing patient info based on ssn */
    router.get('/:SSN', function(req, res)
	{
		/* SELECT
		 * 		SSN,
		 *		first_name,
		 *		last_name,
		 *		DATE_FORMAT(birthdate, '%m/%d/%Y') AS birthdate
		 * FROM
		 * 		patient
		 * WHERE
		 *		SSN = ?;
		 *
		 *
		 *
		 * SELECT
		 * 		doctor.ID,
		 *		doctor.first_name,
		 *		doctor.last_name,
		 *		IfNull(C_ID, 'null') as C_ID,
		 *		IfNull(name, 'null') as name,
		 * 		PAT_SSN as SSN
		 * FROM
		 * 		doctor
		 * INNER JOIN	patient_doctor	ON doctor.ID	= patient_doctor.DOC_ID
		 * LEFT JOIN	clinic			ON doctor.C_ID	= clinic.ID
		 * WHERE
		 *		patient_doctor.PAT_SSN = ?;
		 *
		 *
		 *
		 * SELECT
		 * 		prescription.ID AS pID,
		 * 		DATE_FORMAT(prescription.issue_date, '%m/%d/%Y') AS issue_date,
		 * 		IfNull(clinic.name, 'null') as clinic_name,
		 * 		IfNull(clinic.ID, 'null') as cID,
		 * 		doctor.first_name AS doctor_first_name,
		 * 		doctor.last_name AS doctor_last_name,
		 * 		doctor.ID AS dID,
		 * 		medication.name,
		 * 		medication.ID
		 * FROM
		 * 		prescription
		 * INNER JOIN	medication	ON prescription.MED_ID	= medication.ID
		 * INNER JOIN	doctor		ON prescription.DOC_ID	= doctor.ID
		 * LEFT JOIN	clinic		ON doctor.C_ID = clinic.ID
		 * WHERE prescription.PAT_SSN = ?
		 * ORDER BY prescription.issue_date DESC;
		 */
		req.app.get('mysql').pool.query("SELECT SSN, first_name, last_name, DATE_FORMAT(birthdate, '%m/%d/%Y') AS birthdate FROM patient WHERE SSN = ?; SELECT doctor.ID, doctor.first_name, doctor.last_name, IfNull(C_ID, 'null') as C_ID, IfNull(name, 'null') as name, PAT_SSN as SSN FROM doctor INNER JOIN patient_doctor ON doctor.ID = patient_doctor.DOC_ID LEFT JOIN clinic ON doctor.C_ID	= clinic.ID  WHERE patient_doctor.PAT_SSN = ?; SELECT prescription.ID pID, DATE_FORMAT(prescription.issue_date, '%m/%d/%Y') AS issue_date, IfNull(clinic.name, 'null') as clinic_name, IfNull(clinic.ID, 'null') as cID, doctor.first_name AS doctor_first_name, doctor.last_name AS doctor_last_name, doctor.ID AS dID, medication.name, medication.ID FROM prescription INNER JOIN medication ON prescription.MED_ID = medication.ID INNER JOIN doctor ON prescription.DOC_ID = doctor.ID LEFT JOIN clinic ON doctor.C_ID = clinic.ID WHERE prescription.PAT_SSN = ? ORDER BY prescription.issue_date DESC;", [req.params.SSN, req.params.SSN, req.params.SSN], function(error, results, fields)
		{
			if(error)
			{
				console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
				res.redirect('500',
				{
					error: JSON.stringify(error)
				});
			}
			
			res.render('patient_info',
			{
				title: results[0][0].first_name + " " + results[0][0].last_name + " (" + results[0][0].SSN + ")",
				jsscripts: ["updatePatient.js", "deletePatient_Doctor.js"],
				patient: results[0][0],
				doctor: results[1],
				prescription: results[2]
			});
		});
    });
	
	/* Updates a patient based on ssn */
	router.put('/:SSN', function(req, res)
	{
		/* UPDATE
		 *  	patient
		 * SET
		 *		first_name = ?,
		 *		last_name = ?
		 * WHERE
		 * 		SSN = ?
		 */
		req.app.get('mysql').pool.query("UPDATE patient SET first_name = ?, last_name = ? WHERE SSN = ?", [req.body.first_name, req.body.last_name, req.params.SSN], function(error, results, fields)
		{
            if(error)
			{
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
				res.redirect('500',
				{
					error: JSON.stringify(error)
				});
            }
			
			res.status(200).end();
        });
    });
	
	/* Delete a patient based on ssn */
    router.delete('/:SSN', function(req, res)
	{
        /* DELETE FROM
		 * 		patient
		 * WHERE
		 * 		SSN = ?
		 */
		req.app.get('mysql').pool.query("DELETE FROM patient WHERE SSN = ?", [req.params.SSN], function(error, results, fields)
		{
            if(error)
			{
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
				res.redirect('500',
				{
					error: JSON.stringify(error)
				});
            }
			
			res.status(202).end();
        });
    });
	
	/* Delete a patient_doctor based on ID and SSN */
    router.delete('/deletePatient_Doctor/:SSN/:DOC_ID', function(req, res)
	{
        /* DELETE FROM
		 * 		patient_doctor
		 * WHERE
		 * 		PAT_SSN = ? AND DOC_ID = ?
		 */
		req.app.get('mysql').pool.query("DELETE FROM patient_doctor WHERE PAT_SSN = ? AND DOC_ID = ?", [req.params.SSN, req.params.DOC_ID], function(error, results, fields)
		{
            if(error)
			{
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
				res.redirect('500',
				{
					error: JSON.stringify(error)
				});
            }
			else
			{
                res.redirect(303, '/patient/' + req.params.SSN);
            }
        });
    });
	
	return router;
}();