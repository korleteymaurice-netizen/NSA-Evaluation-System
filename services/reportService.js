const PDFDocument = require('pdfkit');
function makePdf(appointments,res){
  const doc=new PDFDocument({margin:40}); res.setHeader('Content-Type','application/pdf'); res.setHeader('Content-Disposition','attachment; filename="appointment-schedule.pdf"'); doc.pipe(res);
  doc.fontSize(18).text('Evaluation Appointment Schedule'); doc.moveDown(); doc.fontSize(9).text(`Generated: ${new Date().toLocaleString()}`); doc.moveDown();
  appointments.forEach((a,i)=>{ doc.fontSize(10).text(`${i+1}. ${a.student.user.name} | ${a.student.studentId} | ${a.appointmentReference}`); doc.fontSize(9).text(`   ${a.evaluation.title} | ${a.evaluation.date.toLocaleDateString()} | ${a.timeSlot.startTime.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} - ${a.timeSlot.endTime.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} | ${a.status}`); doc.moveDown(.5); }); doc.end();
}
function csv(appointments){ const esc=v=>`"${String(v??'').replaceAll('"','""')}"`; return ['Student Name,Student ID,Appointment Reference,Evaluation Date,Time,Status',...appointments.map(a=>[a.student.user.name,a.student.studentId,a.appointmentReference,a.evaluation.date.toISOString().slice(0,10),`${a.timeSlot.startTime.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}-${a.timeSlot.endTime.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`,a.status].map(esc).join(','))].join('\n'); }
module.exports={makePdf,csv};
