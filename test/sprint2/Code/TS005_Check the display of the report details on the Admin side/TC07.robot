*** Settings ***
Library    SeleniumLibrary

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}        chrome
${URL}            http://localhost:3001/login
${USERNAME}       admin123
${PASSWORD}       123456789
${REPORT_ID}      cmmateekw0007uh12bpe2tjnm


*** Test Cases ***
Verify Admin Can View Report Detail
    Login As Admin
    Open Report Detail
    Verify Report Detail Displayed Correctly


*** Keywords ***

Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    1s


Login As Admin
    Wait Until Element Is Visible    id=identifier    15s


    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}

    Click Element    xpath=//button[normalize-space()="เข้าสู่ระบบ"]
    Wait Until Element Is Not Visible    id=identifier    15s


Open Report Detail
    Go To    http://localhost:3001/admin/reports/${REPORT_ID}
    Wait Until Location Contains    admin/reports    15s
    Wait Until Page Contains    รายละเอียดรายงาน    15s


Verify Report Detail Displayed Correctly

    # ---------- ตรวจข้อมูลผู้แจ้ง ----------
    Page Should Contain    ผู้แจ้ง
    Page Should Contain    Passenger Nakub
    Page Should Contain    Passenger@gmail.com
    Page Should Contain    0123451234
    Capture Page Screenshot    detail_user_info_verified.png

    # ---------- ตรวจวันที่ ----------
    Page Should Contain    วันที่แจ้ง
    Page Should Contain Element    xpath=//*[contains(text(),"2569")]

    Page Should Contain    อัปเดตล่าสุด
    Page Should Contain Element    xpath=//*[contains(text(),"2569")]

    Page Should Contain    หัวข้อ
    Page Should Contain    คนขับมีพฤติกรรมไม่เหมาะสม
    Capture Page Screenshot    detail_title_verified.png

    Page Should Contain    รายละเอียด
    Page Should Contain    คนขับ ขับรถหวาดเสียวและตะโกนด่ารถคันอื่นๆ ตลอด
    Capture Page Screenshot    detail_description_verified.png

    Page Should Contain    ประเภทเหตุการณ์
    Page Should Contain Element    xpath=//span[contains(text(),"ความปลอดภัย")]
    Capture Page Screenshot    detail_category_verified.png

    Page Should Contain    ระดับความสำคัญ
    Page Should Contain Element    xpath=//span[contains(text(),"HIGH")]
    Capture Page Screenshot    detail_priority_verified.png

    Page Should Contain    สถานะปัจจุบัน
    Page Should Contain Element    xpath=//*[contains(text(),"รอดำเนินการ") or contains(text(),"กำลัง") or contains(text(),"แก้ไขแล้ว")]
    Capture Page Screenshot    detail_status_verified.png


    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight/2);
    Sleep    1s

    Page Should Contain    ตำแหน่งเหตุการณ์
    Page Should Contain Element    xpath=//*[contains(text(),"Thailand")]
    Capture Page Screenshot    detail_location_verified.png

    Page Should Contain Element
    ...    xpath=//*[contains(@class,"gm-style") or contains(@class,"leaflet")]
    Capture Page Screenshot    detail_map_verified.png

    # ---------- ตรวจข้อมูลผู้โดยสารใน Trip ----------
    Page Should Contain    ผู้โดยสาร
    Page Should Contain    Passenger Nakub
    Page Should Contain    Passenger@gmail.com

    Page Should Contain    สถานะ Booking
    Page Should Contain    รอดำเนินการ

    Page Should Contain    จำนวนที่นั่ง
    Page Should Contain    1 ที่นั่ง

    Capture Page Screenshot    detail_trip_passenger_verified.png


    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight);
    Sleep    1s

    Page Should Contain    อัปเดตสถานะ
    Page Should Contain Element    xpath=//select
    Capture Page Screenshot    detail_update_section_verified.png

    Page Should Contain    แชทกับผู้แจ้ง
    Page Should Contain Element    xpath=//input[contains(@placeholder,"พิมพ์ข้อความ")]
    Capture Page Screenshot    detail_chat_section_verified.png

