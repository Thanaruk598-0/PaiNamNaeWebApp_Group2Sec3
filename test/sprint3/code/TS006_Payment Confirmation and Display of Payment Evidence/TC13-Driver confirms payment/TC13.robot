*** Settings ***
Library    SeleniumLibrary

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${URL}        http://localhost:3001/login
${BROWSER}    chrome
${USER}       Driver
${PASS}       t1234567


*** Test Cases ***
TC13 Driver Confirm Payment
    Login As Driver
    Open My Route Page
    Select Confirmed Tab
    View Slip
    Confirm Payment
    Verify Payment Success


*** Keywords ***

Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    0.5s


Login As Driver
    Wait Until Element Is Visible    id=identifier    15s
    Input Text    id=identifier    ${USER}
    Input Text    xpath=//input[@type="password"]    ${PASS}
    Click Element    xpath=//button[contains(.,'เข้าสู่ระบบ')]
    Wait Until Element Is Not Visible    id=identifier    15s


Open My Route Page
    Go To    http://localhost:3001/myRoute
    Wait Until Page Contains    คำขอจองเส้นทางของฉัน    15s
    Capture Page Screenshot    route_page.png


Select Confirmed Tab
    Wait Until Element Is Visible
    ...    xpath=//button[contains(.,'ยืนยันแล้ว')]
    ...    10s

    Click Element    xpath=//button[contains(.,'ยืนยันแล้ว')]
    Sleep    1s

    Capture Page Screenshot    confirmed_tab.png


View Slip
    Click Element    xpath=//button[contains(.,'ดูสลิป')]

    # รอ popup แสดง (รูป)
    Wait Until Element Is Visible    xpath=//img    10s
    Capture Page Screenshot    slip_open.png

  
    Run Keyword And Ignore Error
    ...    Click Element    xpath=//button[contains(.,'×')]

    
    Run Keyword And Ignore Error
    ...    Click Element    xpath=//button[contains(@class,'absolute')]

    
    Press Keys    None    ESC

    Sleep    1s


Confirm Payment

    Scroll Element Into View
    ...    xpath=(//button[contains(.,'ยืนยันรับเงิน')])[1]

    Wait Until Element Is Visible
    ...    xpath=(//button[contains(.,'ยืนยันรับเงิน')])[1]
    ...    10s

    Click Element
    ...    xpath=(//button[contains(.,'ยืนยันรับเงิน')])[1]

    Wait Until Element Is Visible
    ...    xpath=//button[contains(.,'ยืนยันได้รับเงินแล้ว')]
    ...    10s

    Capture Page Screenshot    popup_confirm.png

    Click Element
    ...    xpath=//button[contains(.,'ยืนยันได้รับเงินแล้ว')]

    Sleep    2s

    Wait Until Element Is Visible
    ...    xpath=//*[contains(text(),'ชำระแล้ว')]
    ...    10s

    Capture Page Screenshot    success.png

Verify Payment Success
    Wait Until Page Contains    ชำระแล้ว    15s
    Capture Page Screenshot    success.png