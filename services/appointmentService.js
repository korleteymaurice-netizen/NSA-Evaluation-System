const db = require('../utils/db');

async function nextReference(tx){
  const year = new Date().getFullYear();
  const prefix = `EVA-${year}-`;
  const last = await tx.query('SELECT id FROM appointments WHERE appointment_reference LIKE $1 ORDER BY id DESC LIMIT 1',[`${prefix}%`]);
  return `${prefix}${String((last.rows[0]?.id || 0) + 1).padStart(5,'0')}`;
}

async function bookAppointment({studentId,evaluationId,timeSlotId}){
  return db.transaction(async tx=>{
    await tx.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
    const slot=(await tx.query('SELECT s.*,e.title,e.description,e.date,e.location,e.status AS evaluation_status FROM time_slots s JOIN evaluations e ON e.id=s.evaluation_id WHERE s.id=$1 FOR UPDATE',[Number(timeSlotId)])).rows[0];
    if(!slot||slot.evaluation_id!==Number(evaluationId)) throw new Error('INVALID_SLOT');
    if(slot.evaluation_status!=='PUBLISHED'||new Date(slot.date)<new Date(new Date().toDateString())) throw new Error('UNAVAILABLE_EVALUATION');
    if(new Date(slot.start_time)<=new Date()) throw new Error('PAST_SLOT');
    if((await tx.query('SELECT 1 FROM appointments WHERE student_id=$1 AND evaluation_id=$2 AND status<>$3 LIMIT 1',[Number(studentId),Number(evaluationId),'CANCELLED'])).rowCount) throw new Error('DUPLICATE_APPOINTMENT');
    const count=(await tx.query('SELECT count(*)::int AS count FROM appointments WHERE time_slot_id=$1 AND status<>$2',[Number(timeSlotId),'CANCELLED'])).rows[0].count;
    if(count>=slot.capacity) throw new Error('SLOT_FULL');
    const reference=await nextReference(tx);const row=(await tx.query('INSERT INTO appointments (appointment_reference,student_id,evaluation_id,time_slot_id) VALUES ($1,$2,$3,$4) RETURNING id,appointment_reference,status,booked_at,student_id,evaluation_id,time_slot_id',[reference,Number(studentId),Number(evaluationId),Number(timeSlotId)])).rows[0];
    return {...row,id:row.id,appointmentReference:row.appointment_reference,status:row.status,bookedAt:row.booked_at,evaluation:{id:slot.evaluation_id,title:slot.title,description:slot.description,date:slot.date,location:slot.location,status:slot.evaluation_status},timeSlot:{id:slot.id,startTime:slot.start_time,endTime:slot.end_time,capacity:slot.capacity}};
  });
}
module.exports={bookAppointment};
